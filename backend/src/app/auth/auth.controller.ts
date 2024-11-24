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
  @Get('sendToken/:mobile')
  async sendToken(@Param() params) {
    return this.auth.sendToken(PersianNumberService.toEnglish(params.mobile));
  }

  @Get('info')
  async info(@LoginUser() user: User, @Req() request: Request) {
    if (user && user.id) {
      return this.userModel
        .findById(user.id)
        .select('-jwtVersion')
        .populate('subscription')
        .exec();
    }
    throw new HttpException('no user found', HttpStatus.NOT_FOUND);
  }

  @Public()
  @Get('login/:mobile/:token')
  async loginWithToken(@Param() params, @Req() request: Request) {
    const userAgent = request.headers['user-agent'];
    return this.auth.loginWithToken(
      PersianNumberService.toEnglish(params.mobile),
      PersianNumberService.toEnglish(params.token),
      userAgent,
    );
  }

  @Public()
  @Post('login-admin')
  async loginAdmin(@Body() body) {
    return this.auth.loginAdmin(body.username, body.password);
  }
}
