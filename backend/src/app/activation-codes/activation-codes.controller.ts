import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from '../auth/roles.decorators';
import { ActivationCode, UserDevice, UserRole } from '@uptodate/types';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Controller('activationCodes')
@Roles(UserRole.Admin)
export class ActivationCodesController {
  constructor(
    @InjectModel(ActivationCode.name) private codeModel: Model<ActivationCode>,
    @InjectModel(UserDevice.name) private userDeviceModel: Model<UserDevice>,
  ) {}

  @Get()
  all() {
    return this.codeModel.find().sort({ createdAt: 'asc' }).exec();
  }

  @Get('addCode/:id/:count')
  async addCode(@Param('id') id: string, @Param('count') count: string) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const activationCodes = await this.codeModel.find().exec();
    const activationCode = await this.codeModel.findById(id).exec();
    console.log(id, activationCodes, activationCode);
    if (activationCode) {
      const codes = activationCodes.map((item) => item.codes).flat();
      const existingStrings = new Set(codes);
      let i = Number(count);
      const newCodes: string[] = [];
      while (i > 0) {
        let randomString = '';
        for (let i = 0; i < 8; i++) {
          // Adjust string length as needed
          const randomIndex = Math.floor(Math.random() * characters.length);
          randomString += characters[randomIndex];
        }

        if (!existingStrings.has(randomString)) {
          newCodes.push(randomString);
          existingStrings.add(randomString);
          i--;
        }
      }

      activationCode.codes = [...activationCode.codes, ...newCodes];

      await activationCode.save();
      return newCodes;
    }
  }
}
