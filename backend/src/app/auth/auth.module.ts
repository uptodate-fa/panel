import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthController } from './auth.controller';
import { RolesGuard } from './roles.guard';
import { CoreModule } from '../core/core.module';
import { HttpModule } from '@nestjs/axios';
import { SchemasModule } from '../schemas/schemas.module';

@Module({
  imports: [
    SchemasModule,
    CoreModule,
    PassportModule,
    HttpModule,
    JwtModule.register({}),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
