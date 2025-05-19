import {
  Body,
  ConflictException,
  Controller,
  Get,
  GoneException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Response,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ActivationCode,
  DiscountCoupon,
  Payment,
  Subscription,
  SubscriptionDto,
  User,
  UserRole,
} from '@uptodate/types';
import { Model } from 'mongoose';
import { LoginUser } from '../auth/user.decorator';
import { HttpService } from '@nestjs/axios';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorators';

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
    @InjectModel(DiscountCoupon.name)
    private discountsModel: Model<DiscountCoupon>,
    @InjectModel(ActivationCode.name)
    private activationCodeModel: Model<ActivationCode>,
    @InjectModel(Payment.name)
    private paymentModel: Model<Payment>,
    private http: HttpService,
  ) {}

  @Get('active/:code')
  async activeByActivationCode(
    @LoginUser() user: User,
    @Param('code') code: string,
  ) {
    const activationCode = await this.activationCodeModel
      .findOne({ codes: { $in: [code.toUpperCase()] } })
      .exec();

    if (!activationCode) throw new NotFoundException();
    if (
      activationCode.expiredAt &&
      new Date(activationCode.expiredAt).valueOf() < Date.now()
    )
      throw new GoneException('code expired');

    const usedSub = await this.subscriptionModel
      .findOne({ activationCode: code })
      .exec();
    if (usedSub) throw new ConflictException('code already used');

    await this.saveSubscription(
      {
        maxDevice: activationCode.maxActiveDevices,
        days: activationCode.period,
        activationCode: code,
      },
      user,
    );
  }

  @Get('coupon/:code')
  async getDiscountCoupon(
    @LoginUser() user: User,
    @Param('code') code: string,
  ) {
    const coupon = await this.discountsModel
      .findOne({ code: code.toLowerCase() })
      .populate('user')
      .exec();

    if (DiscountCoupon.isValid(coupon, user)) return coupon;
    throw new NotFoundException();
  }

  @Post('payment')
  async payment(@Body() dto: SubscriptionDto, @LoginUser() user: User) {
    let coupon: DiscountCoupon;

    if (dto.discountCouponId) {
      const existCoupon = await this.discountsModel
        .findById(dto.discountCouponId)
        .exec();
      if (DiscountCoupon.isValid(existCoupon, user)) {
        coupon = existCoupon;
      }
    }

    const amount = SubscriptionDto.price(dto, coupon);
    if (amount < 0) return new ConflictException();
    if (amount === 0) {
      this.saveSubscription(dto, user);
      return;
    }
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

  @Public()
  @Post('afterBankPayment')
  async paymentComplete(@Body() data: any, @Response() res) {
    if (data.Status == 'OK') {
      const payment = await this.paymentModel
        .findOne({
          token: data.Authority,
        })
        .populate({
          path: 'user',
          populate: {
            path: 'subscription',
          },
        })
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
        this.saveSubscription(payment.data, payment.user);
      }
    }
  }

  async saveSubscription(dto: SubscriptionDto, user: User) {
    if (user.subscription) {
      console.log(user.subscription.expiredAt);
      const expiredAt = new Date(user.subscription.expiredAt);
      console.log(expiredAt)
      expiredAt.setDate(expiredAt.getDate() + dto.days);
      console.log(expiredAt)
      return this.subscriptionModel
        .findByIdAndUpdate(user.subscription.id, {
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
        activationCode: dto.activationCode,
      });
      const subscription = await createdData.save();

      if (dto.discountCouponId) {
        this.discountsModel
          .findByIdAndUpdate(dto.discountCouponId, { isUsed: true })
          .exec();
      }

      await this.userModel.findByIdAndUpdate(user.id, {
        subscription,
      });
    }
  }

  @Roles(UserRole.Admin)
  @Put(':id')
  updateSubscription(@Body() dto: Subscription, @Param('id') id: string) {
    return this.subscriptionModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
  }
}
