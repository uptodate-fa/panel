import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ProxyService, AuthService],
  exports: [AuthService, ProxyService],
})
export class ProxyModule {}
