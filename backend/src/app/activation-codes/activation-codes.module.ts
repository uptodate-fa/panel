import { Module } from '@nestjs/common';
import { ActivationCodesController } from './activation-codes.controller';
import { SchemasModule } from '../schemas/schemas.module';

@Module({
  imports: [SchemasModule],
  controllers: [ActivationCodesController],
})
export class ActivationCodesModule {}
