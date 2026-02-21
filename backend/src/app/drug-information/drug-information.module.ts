import { Module } from '@nestjs/common';
import { DrugInformationController } from './drug-information.controller';
import { DrugInformationService } from './drug-information.service';

@Module({
  controllers: [DrugInformationController],
  providers: [DrugInformationService],
})
export class DrugInformationModule {}
