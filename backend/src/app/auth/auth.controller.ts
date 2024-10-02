import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginUser } from './user.decorator';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PersianNumberService } from '@uptodate/utils';
import { User } from '@uptodate/types';

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
  @Get('sendToken/:mobile')
  async sendToken(@Param() params) {
    return this.auth.sendToken(PersianNumberService.toEnglish(params.mobile));
  }

  @Get('info')
  async info(@LoginUser() user: User) {
    if (user && user.id) {
      return this.userModel.findById(user.id).populate(['subscription']).exec();
    }
    throw new HttpException('no user found', HttpStatus.NOT_FOUND);
  }

  @Public()
  @Get('login/:mobile/:token')
  async loginWithToken(@Param() params) {
    return this.auth.loginWithToken(
      PersianNumberService.toEnglish(params.mobile),
      PersianNumberService.toEnglish(params.token),
    );
  }
}
