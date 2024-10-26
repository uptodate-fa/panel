export const YEARLY_DAYS = 366;
export const HALF_YEAR_DAYS = 183;

export class SubscriptionDto {
  days: number;
  maxDevice = 1;

  static price(dto?: SubscriptionDto) {
    if (dto?.days === HALF_YEAR_DAYS && dto?.maxDevice === 1) return 2590000;
    if (dto?.days === HALF_YEAR_DAYS && dto?.maxDevice === 2) return 2890000;
    if (dto?.days === YEARLY_DAYS && dto?.maxDevice === 1) return 4290000;
    if (dto?.days === YEARLY_DAYS && dto?.maxDevice === 2) return 4890000;
    return 0;
  }
}
