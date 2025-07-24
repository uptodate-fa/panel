import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Content, ContentHistory, User } from '@uptodate/types';
import { Model } from 'mongoose';
import { ProxyService } from '../proxy/proxy.service';
import * as cheerio from 'cheerio';
import { OpenaiService } from '../openai/openai.service';
import { captureEvent } from '@sentry/node';
import { TopicAssetsSqliteService } from '../core/topic-assets-sqlite.service';

@Injectable()
export class ContentsService {
  constructor(
    private proxy: ProxyService,
    private openai: OpenaiService,
    @InjectModel(Content.name) private contentModel: Model<Content>,
    @InjectModel(ContentHistory.name)
    private contentHistoryModel: Model<ContentHistory>,
    private topicAssetsService: TopicAssetsSqliteService,
  ) {}

  async getContent(
    id: string,
    user?: User,
    topicId?: string,
    forceSync = false,
  ): Promise<Content> {
    const localContent = topicId
      ? await this.topicAssetsService.getTopicById(Number(topicId))
      : null;
    console.log('localContent', id, localContent?.topicInfo_id);
    let content: Content = await this.contentModel
      .findOne({ queryStringId: id })
      .exec();

    if (localContent && !content) {
      const newContent = new this.contentModel({
        queryStringId: id,
        uptodateId: localContent.topicInfo_id || id,
        title: localContent.topicInfo_title,
        bodyHtml: localContent.bodyHtml,
        outlineHtml: localContent.outlineHtml,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      content = await newContent.save();
    }

    const fetchFromUptodate =
      (!topicId &&
        (!content ||
          content.bodyHtml.search(
            'To continue reading this article, you must',
          ) > -1)) ||
      forceSync;

    try {
      captureEvent({
        message: 'get content',
        level: 'log',
        transaction: id,
        tags: {
          source: fetchFromUptodate
            ? 'uptodate'
            : localContent
              ? 'sqlite'
              : 'db',
        },
      });
    } catch (error) {
      console.error('Sentry capture error:', error);
    }

    if (fetchFromUptodate) {
      let data = await this.proxy.content(id);

      if (data) {
        if (content) {
          data = await this.contentModel
            .findByIdAndUpdate(
              content.id,
              {
                ...data,
                translatedAt: null,
                translatedBodyHtml: null,
                translatedOutlineHtml: null,
              },
              {
                new: true,
              },
            )
            .exec();
        } else {
          const newContent = new this.contentModel({
            ...data,
            queryStringId: id,
          });
          data = await newContent.save();
        }
        content = data;
      }
    }

    if (user && content) {
      this.contentHistoryModel
        .findOneAndUpdate(
          { user: user.id, content: content.id },
          { updatedAt: new Date() },
        )
        .populate('content')
        .sort({ createdAt: 'desc' })
        .exec()
        .then(
          (value) => {
            if (!value) {
              const newContentHistory = new this.contentHistoryModel({
                user: user.id,
                content: content.id,
              });
              newContentHistory.save();
            }
          },
          (er) => {
            console.error('Content history error:', er);
          },
        );
    }

    if (
      content &&
      content.translatedAt &&
      content.translatedBodyHtml &&
      content.translatedBodyHtml.length * 2 < content.bodyHtml.length
    ) {
      this.contentModel
        .findByIdAndUpdate(
          content.id,
          {
            translatedAt: null,
            translatedBodyHtml: null,
            translatedOutlineHtml: null,
          },
          {
            new: true,
          },
        )
        .exec();

      content.translatedBodyHtml = null;
      content.translatedOutlineHtml = null;
      content.translatedAt = null;
    }

    if (content && topicId) {
      content.bodyHtml = localContent?.bodyHtml;
      content.outlineHtml = localContent?.outlineHtml;
    }

    return content;
  }

  async getOutline(id: string): Promise<Content> {
    const existContent = await this.contentModel
      .findOne({ uptodateId: id })
      .exec();
    if (existContent) return existContent;

    const data = await this.proxy.outline(id);
    return data;
  }

  async translate(id: string) {
    const content = await this.getContent(id);
    if (content) {
      if (
        content.translatedBodyHtml &&
        content.translatedBodyHtml.length / content.bodyHtml.length > 0.4
      )
        return content;
      if (content.translatedAt) {
        const diff = Date.now() - new Date(content.translatedAt).valueOf();
        if (diff / 60000 < 15) return content;
      }

      this.contentModel
        .updateOne({ queryStringId: id }, { translatedAt: new Date() })
        .exec();

      const [title] = this.parseHtmlBatches(content.bodyHtml, '#topicTitle');
      const batches = this.parseHtmlBatches(content.bodyHtml, '#topicText > *');
      const $ = cheerio.load(content.bodyHtml);

      $('#topicText > *').remove();

      try {
        let i = 0;
        for (const batch of batches) {
          try {
            const translated = await this.openai.getResponse(batch);
            $(translated).appendTo('#topicText');
            i++;
          } catch (error) {
            return null;
          }
        }
        content.translatedBodyHtml = $.html();

        const outline = await this.openai.getResponse(content.outlineHtml);
        content.translatedOutlineHtml = outline;
      } catch (error) {
        console.error('translate error', error);
        await this.contentModel
          .updateOne({ queryStringId: id }, { translatedAt: null })
          .exec();
      }

      return await this.contentModel
        .findOneAndUpdate({ queryStringId: id }, { ...content }, { new: true })
        .exec();
    }
  }

  parseHtmlBatches(htmlString: string, selector: string): Array<string> {
    const $ = cheerio.load(htmlString);
    const batches: Array<string> = [];
    let currentBatch = '';

    // Select all elements
    $(selector).each((_, element) => {
      const el = $(element);
      if (el.hasClass('headingAnchor')) {
        // If currentBatch is not empty, push it to batches
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
          currentBatch = ''; // Reset the batch for the new group
        }
      }
      // Add the outer HTML of the element to the current batch
      currentBatch += el.prop('outerHTML');
    });

    // Push the last batch if it's not empty
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }
}
