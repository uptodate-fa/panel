import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/roles.decorators';
import { User, UserRole } from '@uptodate/types';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Controller('users')
@Roles(UserRole.Admin)
export class UsersController {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  @Get()
  getUsers() {
    return this.userModel
      .find({ role: UserRole.User })
      .populate('subscription')
      .exec();
  }
}
