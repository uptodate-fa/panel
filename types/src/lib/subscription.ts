import { User } from './user';

export class Subscription {
  expiredAt: Date;
  user: User;
  maxActiveDevices: number;
  createdAt: Date;
}
