import { HttpService } from '@nestjs/axios';
import { Controller, Get, Param } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { OpenaiService } from '../openai/openai.service';

@Controller('contents')
export class ContentsController {
  constructor(
    private http: HttpService,
    private proxy: ProxyService,
    private openai: OpenaiService
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

  @Get('translate/:id')
  async getByIdTranslated(@Param('id') id: string) {
    const content = await this.proxy.content(id);
    if (content) {
      // const translated = await this.openai.getResponse(content.bodyHtml);
      // console.log(translated);
      // content.bodyHtml = translated;
      return content;
    }
  }
}
