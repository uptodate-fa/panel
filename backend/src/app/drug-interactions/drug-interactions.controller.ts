import { Controller, Get, Param } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

@Controller('drug-interactions')
export class DrugInteractionsController {
  constructor(private proxy: ProxyService) {}

  @Get('search/:query')
  preSearch(@Param('query') query: string) {
    return this.proxy.searchDrug(query);
  }

  @Get('interactions/:ids')
  interactions(@Param('ids') ids: string) {
    return this.proxy.drugInteractions(ids.split(','));
  }
}
