import { Module } from '@nestjs/common';
import { DrugInteractionsController } from './drug-interactions.controller';
import { DrugInteractionsService } from './drug-interactions.service';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [DrugInteractionsController],
  providers: [DrugInteractionsService],
  exports: [DrugInteractionsService],
})
export class DrugInteractionsModule {}
