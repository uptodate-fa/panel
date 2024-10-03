import { Body, Controller, Get, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Subscription, SubscriptionDto, User } from '@uptodate/types';
import { Model } from 'mongoose';
import { LoginUser } from '../auth/user.decorator';

const ZARINPAL_REQUEST_URL = 'https://api.zarinpal.com/pg/v4/payment/request.json';
const ZARINPAL_START_URL = 'https://www.zarinpal.com/pg/StartPay';
const ZARINPAL_VERIFY_URL = 'https://api.zarinpal.com/pg/v4/payment/verify.json';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  @Post('payment')
  async payment(@Body() dto: SubscriptionDto, @LoginUser() user: User) {
    const existUser = await this.userModel
      .findById(user.id)
      .populate('subscription')
      .exec();
    const existSubscription = existUser?.subscription;
    if (existSubscription) {
      const expiredAt = new Date(existSubscription.expiredAt);
      expiredAt.setDate(expiredAt.getDate() + dto.days);
      return this.subscriptionModel
        .findByIdAndUpdate(existSubscription.id, {
          maxActiveDevices: dto.maxDevice,
          expiredAt,
        })
        .exec();
    } else {
      const expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + dto.days);
      const createdData = new this.subscriptionModel({
        expiredAt,
        maxActiveDevices: dto.maxDevice,
      });
      const subscription = await createdData.save();

      await this.userModel.findByIdAndUpdate(user.id, { subscription });
    }
  }
}
