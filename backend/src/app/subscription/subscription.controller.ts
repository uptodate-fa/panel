import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Query,
  Response,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, Subscription, SubscriptionDto, User } from '@uptodate/types';
import { Model } from 'mongoose';
import { LoginUser } from '../auth/user.decorator';
import { HttpService } from '@nestjs/axios';
import { Public } from '../auth/public.decorator';

const ZARINPAL_REQUEST_URL =
  'https://api.zarinpal.com/pg/v4/payment/request.json';
const ZARINPAL_START_URL = 'https://www.zarinpal.com/pg/StartPay';
const ZARINPAL_VERIFY_URL =
  'https://api.zarinpal.com/pg/v4/payment/verify.json';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Payment.name)
    private paymentModel: Model<Payment>,
    private http: HttpService,
  ) {}

  @Post('payment')
  async payment(@Body() dto: SubscriptionDto, @LoginUser() user: User) {
    const amount = SubscriptionDto.price(dto);
    if (!amount) return new ConflictException();
    const description = `خرید اشتراک`;

    const tokenBody = {
      merchant_id: process.env.MERCHANT_ID,
      amount,
      description,
      mobile: user.phone,
      callback_url: `${process.env.PAYMENT_CALLBACK_URL}`,
    };

    const tokenResponse: any = (
      await this.http.post(ZARINPAL_REQUEST_URL, tokenBody).toPromise()
    ).data.data;

    if (tokenResponse.code == 100) {
      const createdData = new this.paymentModel({
        amount,
        description,
        token: tokenResponse.authority,
        user: user.id,
        data: dto,
        maxActiveDevices: dto.maxDevice,
      });
      // token.invoice = <Invoice>{
      //     id: dto.invoiceId
      // };
      const payment = await createdData.save();
      return `${ZARINPAL_START_URL}/${payment.token}`;
    }
  }

  @Public()
  @Get('afterBankPayment')
  async getPaymentComplete(@Query() query, @Response() res) {
    return this.paymentComplete(query, res);
  }

  @Post('afterBankPayment')
  async paymentComplete(@Body() data: any, @Response() res) {
    if (data.Status == 'OK') {
      const payment = await this.paymentModel
        .findOne({
          token: data.Authority,
        })
        .populate('user.subscription')
        .exec();

      const body = {
        merchant_id: process.env.MERCHANT_ID,
        authority: payment.token,
        amount: payment.amount,
      };
      const confirmResponse: any = (
        await this.http.post(ZARINPAL_VERIFY_URL, body).toPromise()
      ).data.data;
      if (confirmResponse.code == 100 || confirmResponse.code == 101) {
        if (payment?.user?.subscription) {
          const expiredAt = new Date(payment.user.subscription.expiredAt);
          expiredAt.setDate(expiredAt.getDate() + payment.data.days);
          return this.subscriptionModel
            .findByIdAndUpdate(payment.user.subscription.id, {
              maxActiveDevices: payment.data.maxDevice,
              expiredAt,
            })
            .exec();
        } else {
          const expiredAt = new Date();
          expiredAt.setDate(expiredAt.getDate() + payment.data.days);
          const d = {
            expiredAt,
            maxActiveDevices: payment.data.maxDevice,
          };
          console.log(d);
          const createdData = new this.subscriptionModel(d);
          const subscription = await createdData.save();

          await this.userModel.findByIdAndUpdate(payment.user.id, {
            subscription,
          });
        }
      }
    }

    // const existUser = await this.userModel
    //   .findById(user.id)
    //   .populate('subscription')
    //   .exec();
    // const existSubscription = existUser?.subscription;
    // if (existSubscription) {
    //   const expiredAt = new Date(existSubscription.expiredAt);
    //   expiredAt.setDate(expiredAt.getDate() + dto.days);
    //   return this.subscriptionModel
    //     .findByIdAndUpdate(existSubscription.id, {
    //       maxActiveDevices: dto.maxDevice,
    //       expiredAt,
    //     })
    //     .exec();
    // } else {
    //   const expiredAt = new Date();
    //   expiredAt.setDate(expiredAt.getDate() + dto.days);
    //   const createdData = new this.subscriptionModel({
    //     expiredAt,
    //     maxActiveDevices: dto.maxDevice,
    //   });
    //   const subscription = await createdData.save();

    //   await this.userModel.findByIdAndUpdate(user.id, { subscription });
  }
}
