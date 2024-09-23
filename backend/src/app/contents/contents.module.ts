import { Module } from '@nestjs/common';
import { ContentsController } from './contents.controller';
import { HttpModule } from '@nestjs/axios';
import { ProxyModule } from '../proxy/proxy.module';
import { OpenaiModule } from '../openai/openai.module';

@Module({
  imports: [HttpModule, ProxyModule, OpenaiModule],
  controllers: [ContentsController],
})
export class ContentsModule {}
