import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserDevice, UserRole } from '@uptodate/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpStatusCode } from 'axios';
import { UAParser } from 'ua-parser-js';

const DEVICE_CONFLICT_TIME = process.env['DEVICE_CONFLICT_TIME']
  ? Number(process.env['DEVICE_CONFLICT_TIME'])
  : 180000;
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserDevice.name) private userDeviceModel: Model<UserDevice>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: User) {
    if (payload.role === UserRole.User) {
      const devices = await this.userDeviceModel
        .find({ user: payload.id, isExpired: false })
        .exec();
      const currentDevice = devices.find(
        (device) => device.token === payload._jwt,
      );
      if (!currentDevice) {
        throw new UnauthorizedException('Token has been invalidated');
      }

      const conflictDevice = devices.find(
        (device) =>
          device !== currentDevice &&
          device.connectionAt &&
          Date.now() - new Date(device.connectionAt).valueOf() <
            DEVICE_CONFLICT_TIME,
      );

      if (conflictDevice)
        throw new HttpException(
          `Session already active on another device (${UAParser(conflictDevice.userAgent).device.toString()}).`,
          HttpStatusCode.TooEarly,
          {
            description: ``,
          },
        );

      currentDevice.connectionAt = new Date();
      currentDevice.save();

      return payload;
    } else if (payload.role === UserRole.Admin) {
      const user = await this.userModel.findById(payload.id).exec();
      if (user.role !== UserRole.Admin || user?._jwt !== payload._jwt) {
        throw new UnauthorizedException('Token has been invalidated');
      }
      return payload;
    }
  }
}
