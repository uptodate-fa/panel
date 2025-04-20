import { DiscountCoupon } from './discount-coupon';

export const YEARLY_DAYS = 366;
export const HALF_YEAR_DAYS = 183;

export class SubscriptionDto {
  days: number;
  maxDevice = 1;
  discountCouponId?: string;
  activationCode?: string;

  static price(dto?: SubscriptionDto, coupon?: DiscountCoupon) {
    let price = -1;
    if (dto?.days === HALF_YEAR_DAYS && dto?.maxDevice === 1) price = 3750000;
    else if (dto?.days === HALF_YEAR_DAYS && dto?.maxDevice === 2)
      price = 4190000;
    else if (dto?.days === YEARLY_DAYS && dto?.maxDevice === 1) price = 6250000;
    else if (dto?.days === YEARLY_DAYS && dto?.maxDevice === 2) price = 7190000;

    if (price > -1 && coupon) {
      price = (price * (100 - coupon.percentageValue)) / 100;
      price;
    }

    return price;
  }
}
