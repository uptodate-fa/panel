import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from '../auth/roles.decorators';
import { User, UserDevice, UserRole } from '@uptodate/types';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Controller('users')
@Roles(UserRole.Admin)
export class UsersController {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserDevice.name) private userDeviceModel: Model<UserDevice>,
  ) {}

  @Get()
  getUsers() {
    return this.userModel
      .find({ role: UserRole.User })
      .populate(['subscription'])
      .sort({ createdAt: 'desc' })
      .exec();
  }

  @Get('devices/:userId')
  getUserDevices(@Param('userId') userId: string) {
    return this.userDeviceModel
      .find({ user: userId })
      .sort({ createdAt: 'desc' })
      .exec();
  }
}
