import { Module } from '@nestjs/common';
import { UptodateAccountsController } from './uptodate-accounts.controller';
import { SchemasModule } from '../schemas/schemas.module';

@Module({
  imports: [SchemasModule],
  controllers: [UptodateAccountsController],
})
export class UptodateAccountsModule {}
