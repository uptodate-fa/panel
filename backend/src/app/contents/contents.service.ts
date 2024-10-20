import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Content } from '@uptodate/types';
import { Model } from 'mongoose';
import { ProxyService } from '../proxy/proxy.service';
import * as cheerio from 'cheerio';
import { OpenaiService } from '../openai/openai.service';

@Injectable()
export class ContentsService {
  constructor(
    private proxy: ProxyService,
    private openai: OpenaiService,
    @InjectModel(Content.name) private contentModel: Model<Content>,
  ) {}

  async getContent(id: string): Promise<Content> {
    const existContent = await this.contentModel
      .findOne({ queryStringId: id })
      .exec();
    if (existContent) return existContent;

    const data = await this.proxy.content(id);

    if (data) {
      const newContent = new this.contentModel({
        ...data,
        queryStringId: id,
      });
      newContent.save();
    }
    return data;
  }

  async getOutline(id: string): Promise<Content> {
    const existContent = await this.contentModel
      .findOne({ queryStringId: id })
      .exec();
    if (existContent) return existContent;

    const data = await this.proxy.outline(id);
    return data;
  }

  async translate(id: string) {
    const content = await this.getContent(id);
    if (content) {
      if (content.translatedBodyHtml) return content;
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
      console.log('translate start');

      try {
        let i = 0;
        for (const batch of batches) {
          const translated = await this.openai.getResponse(batch);
          $(translated).appendTo('#topicText');
          console.log(`${i + 1} from ${batches.length}`);
          i++;
        }
        content.translatedBodyHtml = $.html();

        const outline = await this.openai.getResponse(content.outlineHtml);
        content.translatedOutlineHtml = outline;
      } catch (error) {
        console.log('translate error');
        await this.contentModel
          .updateOne({ queryStringId: id }, { translatedAt: null })
          .exec();
      }

      console.log('translate done');
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
