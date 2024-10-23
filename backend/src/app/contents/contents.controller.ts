import { Controller, Get, Param, Query } from '@nestjs/common';
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
  search(@Param('query') query: string, @Query('sp') sp?: string) {
    return this.proxy.search(query, sp ? Number(sp) : 0);
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

  @Get('tableOfContent/:topic/:sub')
  async getTableOfContentWitSub(
    @Param('topic') topic: string,
    @Param('sub') sub: string,
  ) {
    return this.proxy.tableOfContent(topic, sub);
  }
}
