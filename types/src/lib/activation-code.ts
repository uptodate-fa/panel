export class ActivationCode {
  _id: string;
  title: string;
  codes: string[];
  maxActiveDevices: number;
  period: number;
  expiredAt?: Date;
  createdAt: Date;
}
