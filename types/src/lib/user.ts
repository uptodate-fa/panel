export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
}

export class User {
  id: string;
  phone: string;
  role: UserRole;
  token?: string;
  exp?: number;
}
