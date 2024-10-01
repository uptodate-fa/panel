export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
}

export class User {
  id: string;
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
  createdAt: Date;
}
