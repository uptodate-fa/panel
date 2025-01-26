import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { CoreModule } from '../core/core.module';
import { SchemasModule } from '../schemas/schemas.module';

@Module({
  imports: [HttpModule, CoreModule, SchemasModule],
  providers: [ProxyService, AuthService],
  exports: [AuthService, ProxyService],
})
export class ProxyModule {}
