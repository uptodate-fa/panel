import { Subscription } from './subscription';

export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
}

export class User {
  id: string;
  _id: string;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  email?: string;
  job?: string;
  city?: string;
  phone: string;
  role: UserRole;
  token?: string;
  exp?: number;
  subscription?: Subscription;
  createdAt: Date;
  _jwt: number;
}

export class UserToken {
  user: User;
  token: string;
  expired: boolean;
  createdAt: Date;
}

export class UserDevice {
  id: string;
  _id: string;
  userAgent: string;
  user: User;
  token: number;
  isExpired?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
