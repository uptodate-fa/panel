import { User } from './user';

export class Payment {
  id: string;
  token: string;
  amount: number;
  description?: string;
  data?: any;
  user: User;
  success: boolean;
  errorText?: string;
  createdAt: Date;
}
