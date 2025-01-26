export enum UptodateAccountStatus {
  Active = 'ACTIVE',
  Blocked = 'BLOCKED',
  Wrong = 'WRONG',
  Unknown = 'UNKNOWN',
}

export class UptodateAccount {
  _id: string;
  id: string;
  status?: UptodateAccountStatus;
  errorMessage?: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  loginAt: Date;
  blockedAt: Date;
}
