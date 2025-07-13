import { User } from './user';

export class Payment {
  id: string;
  token: string;
  amount: number;
  description?: string;
  data?: any;
  user: User;
  success: boolean;
  origin?: string;
  errorText?: string;
  createdAt: Date;
}
