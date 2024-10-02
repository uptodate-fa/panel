import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, Subscription, User } from '@uptodate/types';
import { UserSchema } from './user.schema';
import { LogSchema } from './log.schema';
import { SubscriptionSchema } from './subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Log.name, schema: LogSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SchemasModule {}
