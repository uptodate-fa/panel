import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ActivationCode,
  Content,
  ContentHistory,
  DiscountCoupon,
  Log,
  Payment,
  Subscription,
  UptodateAccount,
  User,
  UserDevice,
} from '@uptodate/types';
import { UserSchema } from './user.schema';
import { LogSchema } from './log.schema';
import { SubscriptionSchema } from './subscription.schema';
import { ContentSchema } from './content.schema';
import { PaymentSchema } from './payment.schema';
import { ContentHistorySchema } from './content-history.schema';
import { DiscountCouponSchema } from './discount-coupon.schema';
import { UserDeviceSchema } from './user-device.schema';
import { ActivationCodeSchema } from './activation-code.schema';
import { UptodateAccountSchema } from './uptodate-account.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivationCode.name, schema: ActivationCodeSchema },
      { name: User.name, schema: UserSchema },
      { name: Log.name, schema: LogSchema },
      { name: UserDevice.name, schema: UserDeviceSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Content.name, schema: ContentSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: ContentHistory.name, schema: ContentHistorySchema },
      { name: DiscountCoupon.name, schema: DiscountCouponSchema },
      { name: UptodateAccount.name, schema: UptodateAccountSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SchemasModule {}
