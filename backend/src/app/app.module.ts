import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyModule } from './proxy/proxy.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ContentsModule } from './contents/contents.module';

@Module({
  imports: [ConfigModule.forRoot(), ProxyModule, HttpModule, ContentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
