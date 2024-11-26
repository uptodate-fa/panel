import { User } from './user';

export class Subscription {
  _id: string;
  id: string;
  expiredAt: Date;
  user: User;
  maxActiveDevices: number;
  activationCode?: string;
  createdAt: Date;
}