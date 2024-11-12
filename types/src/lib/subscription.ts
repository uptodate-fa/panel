import { User } from './user';

export class Subscription {
  id: string;
  expiredAt: Date;
  user: User;
  maxActiveDevices: number;
  activationCode?: string;
  createdAt: Date;
}