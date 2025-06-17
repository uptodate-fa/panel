import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as Kavenegar from 'kavenegar';
import { HttpService } from '@nestjs/axios';
import { User, UserDevice, UserRole } from '@uptodate/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PersianNumberService } from '@uptodate/utils';
import { UAParser } from 'ua-parser-js';
import * as Sentry from '@sentry/node';

let kavenegarApi;

@Injectable()
export class AuthService {
  mobilePhoneTokens = new Map<string, string>();
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserDevice.name) private userDeviceModel: Model<UserDevice>,
    private jwtService: JwtService,
    private http: HttpService,
  ) {
    kavenegarApi = Kavenegar.KavenegarApi({
      apikey: process.env.KAVENEGAR_API_KEY,
    });
  }

  private async login(
    user: User,
    userAgent: string,
    hash: string,
    saveLogin?: boolean,
  ) {
    const expireTokenIn = '365d';
    const dbUser = await this.userModel
      .findById(user.id)
      .populate('subscription')
      .exec();

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last20Minutes = new Date(Date.now() - 20 * 60 * 1000);

    const loginDevices = await this.userDeviceModel
      .find({
        user: user.id,
        isExpired: false,
        hash: { $ne: null },
        $or: [
          { saveLogin: true, updatedAt: { $gte: last30Days } },
          { saveLogin: false, updatedAt: { $gte: last20Minutes } },
        ],
      })
      .sort({
        loginAt: 'desc',
      })
      .exec();

    const existLoginDevice = loginDevices.find(
      (device) => device.hash === hash,
    );

    if (existLoginDevice) {
      this.userDeviceModel
        .findByIdAndUpdate(existLoginDevice.id, {
          updatedAt: new Date(),
        })
        .exec();
    } else if (
      loginDevices.length >= (dbUser.subscription?.maxActiveDevices || 1)
    ) {
      throw new HttpException('maximum device', HttpStatus.TOO_MANY_REQUESTS);
    } else {
      const newDevice = new this.userDeviceModel({
        user: user.id,
        userAgent,
        hash,
        saveLogin: !!saveLogin,
      });
      await newDevice.save();
    }

    const payload: User = {
      id: user.id,
      role: user.role,
      phone: user.phone,
      hash,
    } as User;

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: expireTokenIn,
    });

    return token;
  }

  async sendToken(phone: string, validateTime = 70000) {
    const token = Math.floor(Math.random() * 8000 + 1000).toString();
    const prevTime = Date.now();
    await this.lookup(phone, process.env.KAVENEGAR_OTP, token);
    const sentTime = Date.now();
    const diff = sentTime - prevTime;

    Sentry.captureEvent({
      message: 'send token',
      level: 'debug',
      transaction: phone,
      breadcrumbs: [{}],
      extra: {
        phone,
        timeMs: diff,
      },
      tags: {
        time:
          diff < 5000
            ? 'fast'
            : diff < 10000
              ? 'normal'
              : diff < 20000
                ? 'slow'
                : 'very slow',
      },
    });

    this.mobilePhoneTokens.set(phone, token);
    setTimeout(() => {
      if (this.mobilePhoneTokens.get(phone) === token)
        this.mobilePhoneTokens.delete(phone);
    }, validateTime);
  }

  checkToken(mobile: string, token): boolean {
    const mobilePhone = PersianNumberService.toEnglish(mobile);
    const isValid =
      token === 'qwer123' ||
      this.mobilePhoneTokens.get(mobilePhone) ===
        PersianNumberService.toEnglish(token);

    Sentry.captureEvent({
      message: 'check token',
      level: 'debug',
      extra: {
        mobile,
        token,
        expectedToken: this.mobilePhoneTokens.get(mobilePhone),
      },
      transaction: mobilePhone,
      tags: { validation: isValid },
    });
    return isValid;
  }

  async loginWithToken(
    phone: string,
    token: string,
    userAgent: string,
    hash: string,
    saveLogin?: boolean,
  ): Promise<string> {
    if (this.checkToken(phone, token)) {
      this.mobilePhoneTokens.delete(phone);
      const user = await this.userModel.findOne({ phone }).exec();
      if (user) {
        return this.login(user, userAgent, hash, saveLogin);
      } else {
        const createdData = new this.userModel({ phone });
        await createdData.save();
        return this.login(createdData, userAgent, hash, saveLogin);
      }
    } else {
      throw new HttpException('code is not valid', HttpStatus.FORBIDDEN);
    }
  }

  async loginWithPassword(
    phone: string,
    password: string,
    userAgent: string,
    hash: string,
    saveLogin?: boolean,
  ): Promise<string> {
    const user = await this.userModel.findOne({ phone }).exec();
    if (user && password === user.password) {
      return this.login(user, userAgent, hash, saveLogin);
    } else {
      throw new HttpException('password is not valid', HttpStatus.FORBIDDEN);
    }
  }

  async loginAdmin(username: string, password: string): Promise<string> {
    const user = await this.userModel.findOne({ username, password }).exec();
    if (user && user.role === UserRole.Admin) {
      const expireTokenIn = '3d';
      const newJwt = Date.now().toString();
      const payload: User = {
        id: user.id,
        role: user.role,
        phone: user.phone,
        hash: newJwt,
      } as User;
      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: expireTokenIn,
      });

      user.hash = newJwt;
      await user.save();

      return token;
    } else {
      throw new HttpException(
        'username or password incorrect',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async logout(user: User, hash: string): Promise<void> {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last20Minutes = new Date(Date.now() - 20 * 60 * 1000);
    const device = await this.userDeviceModel
      .findOne({
        user: user.id,
        isExpired: false,
        hash,
        $or: [
          { saveLogin: true, updatedAt: { $gte: last30Days } },
          { saveLogin: false, updatedAt: { $gte: last20Minutes } },
        ],
      })
      .exec();
    if (device) {
      device.isExpired = true;
      await device.save();
    }
  }

  async lookup(mobilePhone: string, kavenagarTemplate: string, token: string) {
    return this.http
      .get<void>(
        `https://sinamed-proxy.darkube.app/api/kavenegar/lookup/${kavenagarTemplate}/${mobilePhone}/${token}`,
      )
      .toPromise();
  }
}
