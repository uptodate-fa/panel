import { HttpService } from '@nestjs/axios';
import { Controller, Get, Param } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

@Controller('contents')
export class ContentsController {
  constructor(private http: HttpService, private proxy: ProxyService) {}

  @Get('presearch/:query')
  preSearch(@Param('query') query: string) {
    return this.proxy.preSearch(query);
  }

  @Get('search/:query')
  search(@Param('query') query: string) {
    console.log(query)
    return this.proxy.search(query);
  }
}
