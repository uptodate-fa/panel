import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyModule } from './proxy/proxy.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ContentsModule } from './contents/contents.module';
import { CoreModule } from './core/core.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { SchemasModule } from './schemas/schemas.module';
import { DrugInteractionsModule } from './drug-interactions/drug-interactions.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UsersModule } from './users/users.module';
import { ActivationCodesModule } from './activation-codes/activation-codes.module';
import { UptodateAccountsModule } from './uptodate-accounts/uptodate-accounts.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
    }),
    SchemasModule,
    AuthModule,
    ProxyModule,
    HttpModule,
    ContentsModule,
    CoreModule,
    DrugInteractionsModule,
    SubscriptionModule,
    UsersModule,
    ActivationCodesModule,
    UptodateAccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
