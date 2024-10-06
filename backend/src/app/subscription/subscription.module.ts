import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SchemasModule } from '../schemas/schemas.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SchemasModule, HttpModule],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
