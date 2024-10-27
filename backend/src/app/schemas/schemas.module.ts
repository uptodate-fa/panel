import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Content,
  ContentHistory,
  DiscountCoupon,
  Log,
  Payment,
  Subscription,
  User,
} from '@uptodate/types';
import { UserSchema } from './user.schema';
import { LogSchema } from './log.schema';
import { SubscriptionSchema } from './subscription.schema';
import { ContentSchema } from './content.schema';
import { PaymentSchema } from './payment.schema';
import { ContentHistorySchema } from './content-history.schema';
import { DiscountCouponSchema } from './discount-coupon.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Log.name, schema: LogSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Content.name, schema: ContentSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: ContentHistory.name, schema: ContentHistorySchema },
      { name: DiscountCoupon.name, schema: DiscountCouponSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SchemasModule {}
