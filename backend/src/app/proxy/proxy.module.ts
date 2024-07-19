import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [HttpModule, CoreModule],
  providers: [ProxyService, AuthService],
  exports: [AuthService, ProxyService],
})
export class ProxyModule {}
