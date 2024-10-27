import { User } from './user';

export class DiscountCoupon {
  _id: string;
  code: string;
  user?: User;
  percentageValue: number;
  isUsed: boolean;
  expiredAt?: Date;

  static isValid(coupon?: DiscountCoupon, user?: User) {
    return (
      !!coupon &&
      !coupon.isUsed &&
      (!coupon.user || coupon.user.id === user?.id) &&
      (!coupon.expiredAt || new Date(coupon.expiredAt).valueOf() > Date.now())
    );
  }
}
