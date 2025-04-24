import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginUser } from './user.decorator';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PersianNumberService } from '@uptodate/utils';
import { User } from '@uptodate/types';
import { UAParser } from 'ua-parser-js';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @Put('edit')
  async editUser(@Body() dto: User, @LoginUser() user: User) {
    return this.userModel.findByIdAndUpdate(user.id, dto).exec();
  }

  @Public()
  @Get('preLogin/:mobile')
  async preLogin(@Param() params) {
    const phone = PersianNumberService.toEnglish(params.mobile);
    const user = await this.userModel.findOne({ phone }).exec();
    if (user?.password) {
      return { password: true };
    } else {
      await this.auth.sendToken(PersianNumberService.toEnglish(params.mobile));
      return { password: false };
    }
  }

  @Public()
  @Get('sendToken/:mobile')
  async sendToken(@Param() params) {
    return this.auth.sendToken(PersianNumberService.toEnglish(params.mobile));
  }

  @Get('info')
  async info(@LoginUser() user: User, @Req() request: Request) {
    if (user && user.id) {
      const dbUser = await this.userModel
        .findById(user.id)
        .select('-jwtVersion')
        .populate('subscription')
        .exec();

      if (dbUser.password) dbUser.password = '***';
      return dbUser;
    }
    throw new HttpException('no user found', HttpStatus.NOT_FOUND);
  }

  @Post('password')
  async setPassword(
    @LoginUser() user: User,
    @Body() dto: { password: string },
  ) {
    if (user && user.id) {
      return this.userModel
        .findByIdAndUpdate(user.id, {
          password: dto.password,
        })
        .exec();
    }
    throw new HttpException('no user found', HttpStatus.NOT_FOUND);
  }

  @Public()
  @Post('loginOtp')
  async loginWithToken(
    @Body()
    dto: {
      phone: string;
      otp: string;
      hash: string;
      saveLogin?: boolean;
    },
    @Req() request: Request,
  ) {
    const userAgent = request.headers['user-agent'];
    return this.auth.loginWithToken(
      PersianNumberService.toEnglish(dto.phone),
      PersianNumberService.toEnglish(dto.otp),
      userAgent,
      dto.hash,
      dto.saveLogin,
    );
  }

  @Public()
  @Post('login')
  async loginWithPassword(
    @Body()
    dto: {
      phone: string;
      password: string;
      hash: string;
      saveLogin?: boolean;
    },
    @Req() request: Request,
  ) {
    const userAgent = request.headers['user-agent'];
    return this.auth.loginWithPassword(
      PersianNumberService.toEnglish(dto.phone),
      dto.password,
      userAgent,
      dto.hash,
      dto.saveLogin,
    );
  }

  @Public()
  @Post('login-admin')
  async loginAdmin(@Body() body) {
    return this.auth.loginAdmin(body.username, body.password);
  }

  @Get('logout/:hash')
  async logout(@Param() params, @LoginUser() user: User) {
    return this.auth.logout(user, params.hash);
  }
}
