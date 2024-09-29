import { Module } from '@nestjs/common';
import { DrugInteractionsController } from './drug-interactions.controller';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [DrugInteractionsController],
})
export class DrugInteractionsModule {}
