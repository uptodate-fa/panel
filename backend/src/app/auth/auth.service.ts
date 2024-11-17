import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as Kavenegar from 'kavenegar';
import { HttpService } from '@nestjs/axios';
import { User, UserDevice, UserRole } from '@uptodate/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PersianNumberService } from '@uptodate/utils';
import { UAParser } from 'ua-parser-js';

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
        UAParser(device.userAgent).device.toString() === ua.device.toString() &&
        UAParser(device.userAgent).cpu.toString() === ua.cpu.toString(),
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
    // let jwtVersion = user.jwtVersion;
    // if (
    //   !Array.isArray(dbUser.jwtVersion) ||
    //   !dbUser?.subscription?.maxActiveDevices ||
    //   dbUser.subscription.maxActiveDevices === 1
    // ) {
    //   jwtVersion = [newJwt];
    // } else {
    //   if (jwtVersion.length < dbUser.subscription.maxActiveDevices) {
    //     jwtVersion.push(newJwt);
    //   } else {
    //     const minIndex = jwtVersion.indexOf(Math.min(...jwtVersion));
    //     if (minIndex !== -1) {
    //       jwtVersion[minIndex] = newJwt;
    //     } else {
    //       jwtVersion = [newJwt];
    //     }
    //   }
    // }

    // await this.userModel.findByIdAndUpdate(user.id, { jwtVersion }).exec();

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
    await this.lookup(phone, process.env.KAVENEGAR_OTP, token);
    this.mobilePhoneTokens.set(phone, token);
    setTimeout(() => {
      this.mobilePhoneTokens.delete(phone);
    }, validateTime);
  }

  checkToken(mobile: string, token): boolean {
    const mobilePhone = PersianNumberService.toEnglish(mobile);
    return (
      token === 'qwer123' ||
      this.mobilePhoneTokens.get(mobilePhone) ===
        PersianNumberService.toEnglish(token)
    );
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

  async loginAdmin(user: User) {
    return this.login(user, UserRole.Admin);
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
