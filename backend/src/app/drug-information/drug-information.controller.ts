import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { DrugInformationService } from './drug-information.service';

@Controller('drug-information')
export class DrugInformationController {
  constructor(private readonly drugInformationService: DrugInformationService) {}

  @Public()
  @Get('search/:query')
  async search(@Param('query') query: string) {
    return this.drugInformationService.searchDrugsByName(query);
  }
}
