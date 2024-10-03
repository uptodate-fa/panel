import { HttpService } from '@nestjs/axios';
import { Controller, Get, Param } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { OpenaiService } from '../openai/openai.service';
import * as cheerio from 'cheerio';
import { forkJoin } from 'rxjs';

@Controller('contents')
export class ContentsController {
  constructor(
    private http: HttpService,
    private proxy: ProxyService,
    private openai: OpenaiService,
  ) {}

  @Get('presearch/:query')
  preSearch(@Param('query') query: string) {
    return this.proxy.preSearch(query);
  }

  @Get('search/:query')
  search(@Param('query') query: string) {
    return this.proxy.search(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.proxy.content(id);
  }

  @Get('outline/:id')
  getOutlineById(@Param('id') id: string) {
    return this.proxy.outline(id);
  }

  @Get('translate/:id')
  async getByIdTranslated(@Param('id') id: string) {
    const content = await this.proxy.content(id);
    if (content) {
      const [title] = this.parseHtmlBatches(content.bodyHtml, '#topicTitle');
      const batches = this.parseHtmlBatches(content.bodyHtml, '#topicText > *');
      const $ = cheerio.load(content.bodyHtml);

      $('#topicText > *').remove();
      console.log('translate start');

      let i = 0;
      for (const batch of batches) {
        try {
          const translated = await this.openai.getResponse(batch);
          $(translated).appendTo('#topicText');
        } catch (error) {
          console.log('translate error', error);
        }
        i++;
      }

      // try {
      //   const translatedTitle = await this.openai.getResponse(title);
      //   console.log(translatedTitle)
      //   $('#topicTitle').replaceWith(translatedTitle);
      // } catch (error) {
      //   console.log('translate title error', error);
      // }

      console.log('translate done');

      content.bodyHtml = $.html();
      return content;
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
