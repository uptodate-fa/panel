import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { DrugInteractionsService } from './drug-interactions.service';
import { Public } from '../auth/public.decorator';

@Controller('drug-interactions')
export class DrugInteractionsController {
  constructor(
    private proxy: ProxyService,
    private drugInteractionsService: DrugInteractionsService,
  ) {}

  // Previous endpoints using ProxyService
  @Get('search/:query')
  preSearch(@Param('query') query: string) {
    return this.proxy.searchDrug(query);
  }

  @Get('interactions/:ids')
  interactions(@Param('ids') ids: string) {
    return this.proxy.drugInteractions(ids.split(','));
  }

  @Get('interactions/details/:id')
  interactionDetails(@Param('id') id: string) {
    return this.proxy.drugInteractionsDetails(id);
  }

  // New endpoints using SQLite service
  @Public()
  @Get('search-sqlite/:query')
  async searchDrugSqlite(@Param('query') query: string) {
    return this.drugInteractionsService.searchDrug(query);
  }

  @Public()
  @Post('analyze-sqlite')
  async analyzeSqlite(
    @Body()
    body: {
      items: Array<{
        item_id: number;
        name: string;
        generic_id: number;
        brand_id: number;
      }>;
    },
  ) {
    return this.drugInteractionsService.analyze(body.items);
  }
}
