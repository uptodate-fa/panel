import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KavenegarController } from './kavenegar.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [AppController, KavenegarController],
  providers: [AppService],
})
export class AppModule {}
