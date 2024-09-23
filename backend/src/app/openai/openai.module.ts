import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { SchemasModule } from '../schemas/schemas.module';

@Module({
  imports: [SchemasModule],
  providers: [OpenaiService],
  exports: [OpenaiService],
})
export class OpenaiModule {}
