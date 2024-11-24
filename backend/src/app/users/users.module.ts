import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { SchemasModule } from '../schemas/schemas.module';

@Module({
  imports: [SchemasModule],
  controllers: [UsersController],
})
export class UsersModule {}
