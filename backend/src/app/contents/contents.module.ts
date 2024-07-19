import { Module } from '@nestjs/common';
import { ContentsController } from './contents.controller';
import { HttpModule } from '@nestjs/axios';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [HttpModule, ProxyModule],
  controllers: [ContentsController],
})
export class ContentsModule {}
