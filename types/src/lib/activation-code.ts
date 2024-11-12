import { User } from './user';

export class ActivationCode {
  _id: string;
  codes: string[];
  maxActiveDevices: number;
  period: number;
  expiredAt?: Date;
}
