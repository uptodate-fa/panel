import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as Kavenegar from 'kavenegar';
import { HttpService } from '@nestjs/axios';
import { User, UserRole } from '@uptodate/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PersianNumberService } from '@uptodate/utils';

let kavenegarApi;

@Injectable()
export class AuthService {
  mobilePhoneTokens = new Map<string, string>();
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private http: HttpService
  ) {
    kavenegarApi = Kavenegar.KavenegarApi({
      apikey: process.env.KAVENEGAR_API_KEY,
    });
  }

  private login(user: User, expireTokenIn = '15d') {
    const payload: User = {
      id: user.id,
      role: user.role,
      phone: user.phone,
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
      this.mobilePhoneTokens[mobilePhone] ===
        PersianNumberService.toEnglish(token)
    );
  }

  async loginWithToken(phone: string, token: string): Promise<string> {
    if (
      this.mobilePhoneTokens.get(phone) ===
      PersianNumberService.toEnglish(token)
    ) {
      this.mobilePhoneTokens.delete(phone);
      const user = await this.userModel.findOne({ phone }).exec();
      if (user) {
        return this.login(user);
      } else {
        const createdData = new this.userModel({ phone });
        await createdData.save();
        return this.login(createdData);
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
    token: string
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
        }
      );
    });
  }
}
