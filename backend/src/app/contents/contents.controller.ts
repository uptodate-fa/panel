import { Controller, Get, Param } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { ContentsService } from './contents.service';

@Controller('contents')
export class ContentsController {
  constructor(
    private proxy: ProxyService,
    private contentsService: ContentsService,
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
    return this.contentsService.getContent(id);
  }

  @Get('outline/:id')
  getOutlineById(@Param('id') id: string) {
    return this.contentsService.getOutline(id);
  }

  @Get('translate/:id')
  async getByIdTranslated(@Param('id') id: string) {
    return this.contentsService.translate(id);
  }

  @Get('tableOfContent/:topic')
  async getTableOfContent(@Param('topic') topic: string) {
    return this.proxy.tableOfContent(topic);
  }
}
