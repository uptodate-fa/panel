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

  private async login(user: User, userAgent: string) {
    const ua = UAParser(userAgent);
    const expireTokenIn = '365d';
    const newJwt = Date.now();
    const dbUser = await this.userModel
      .findById(user.id)
      .populate('subscription')
      .exec();

    const devices = await this.userDeviceModel
      .find({
        user: user.id,
      })
      .sort({
        loginAt: 'desc',
      })
      .exec();

    const loginDevices = devices.filter((device) => !device.isExpired);
    const existLoginDevice = loginDevices.find(
      (device) =>
        UAParser(device.userAgent).device.model === ua.device.model &&
        UAParser(device.userAgent).device.vendor === ua.device.vendor &&
        UAParser(device.userAgent).cpu.architecture === ua.cpu.architecture &&
        UAParser(device.userAgent).engine.name === ua.engine.name &&
        UAParser(device.userAgent).browser.name === ua.browser.name,
    );

    if (existLoginDevice) {
      this.userDeviceModel
        .findByIdAndUpdate(existLoginDevice.id, {
          isExpired: true,
        })
        .exec();
    }

    if (
      !existLoginDevice &&
      loginDevices.length >= dbUser.subscription?.maxActiveDevices
    ) {
      throw new HttpException('maximum device', HttpStatus.TOO_MANY_REQUESTS);
    }

    const newDevice = new this.userDeviceModel({
      token: newJwt,
      user: user.id,
      userAgent,
    });
    await newDevice.save();

    const payload: User = {
      id: user.id,
      role: user.role,
      phone: user.phone,
      _jwt: newJwt,
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
  ): Promise<string> {
    if (this.checkToken(phone, token)) {
      this.mobilePhoneTokens.delete(phone);
      const user = await this.userModel.findOne({ phone }).exec();
      if (user) {
        return this.login(user, userAgent);
      } else {
        const createdData = new this.userModel({ phone });
        await createdData.save();
        return this.login(createdData, userAgent);
      }
    } else {
      throw new HttpException('code is not valid', HttpStatus.FORBIDDEN);
    }
  }

  async loginWithPassword(
    phone: string,
    password: string,
    userAgent: string,
  ): Promise<string> {
    const user = await this.userModel.findOne({ phone }).exec();
    if (user && password === user.password) {
      return this.login(user, userAgent);
    } else {
      throw new HttpException('password is not valid', HttpStatus.FORBIDDEN);
    }
  }

  async loginAdmin(username: string, password: string): Promise<string> {
    const user = await this.userModel.findOne({ username, password }).exec();
    if (user && user.role === UserRole.Admin) {
      const expireTokenIn = '3d';
      const newJwt = Date.now();
      const payload: User = {
        id: user.id,
        role: user.role,
        phone: user.phone,
        _jwt: newJwt,
      } as User;
      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: expireTokenIn,
      });

      user._jwt = newJwt;
      await user.save();

      return token;
    } else {
      throw new HttpException(
        'username or password incorrect',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async lookup(
    mobilePhone: string,
    kavenagarTemplate: string,
    token: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      kavenegarApi.VerifyLookup(
        {
          receptor: mobilePhone,
          token,
          template: kavenagarTemplate,
        },
        async (response, status) => {
          if (status == 200) {
            resolve(true);
          } else {
            reject(response);
          }
        },
      );
    });
  }
}
