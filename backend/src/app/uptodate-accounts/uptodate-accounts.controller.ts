import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../auth/roles.decorators';
import { UptodateAccount, UserRole } from '@uptodate/types';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Controller('uptodateAccounts')
@Roles(UserRole.Admin)
export class UptodateAccountsController {
  constructor(
    @InjectModel(UptodateAccount.name)
    private accountModel: Model<UptodateAccount>,
  ) {}

  @Get()
  all() {
    return this.accountModel.find().sort({ createdAt: 'desc' }).exec();
  }

  @Post()
  add(@Body() dto: UptodateAccount) {
    if (dto.id || dto._id) {
      const { id, _id, ...data } = dto;
      return this.accountModel.findByIdAndUpdate(id || _id, {
        ...data,
        status: null,
      });
    } else {
      const createdData = new this.accountModel(dto);
      return createdData.save();
    }
  }
}
