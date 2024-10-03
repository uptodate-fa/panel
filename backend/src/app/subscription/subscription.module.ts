import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SchemasModule } from '../schemas/schemas.module';

@Module({
  imports: [SchemasModule],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
