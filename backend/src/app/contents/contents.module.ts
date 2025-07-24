import { Module } from '@nestjs/common';
import { ContentsController } from './contents.controller';
import { ProxyModule } from '../proxy/proxy.module';
import { OpenaiModule } from '../openai/openai.module';
import { ContentsService } from './contents.service';
import { SchemasModule } from '../schemas/schemas.module';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [ProxyModule, OpenaiModule, SchemasModule, CoreModule],
  controllers: [ContentsController],
  providers: [ContentsService],
})
export class ContentsModule {}
