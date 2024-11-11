import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserDevice } from '@uptodate/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
    const devices = await this.userDeviceModel
      .find({ user: payload.id, isExpired: false })
      .exec();

    if (!devices.find((device) => device.token === payload._jwt)) {
      throw new UnauthorizedException('Token has been invalidated');
    }
    return payload;
  }
}
