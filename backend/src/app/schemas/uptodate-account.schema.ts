import { UptodateAccount, UptodateAccountStatus } from '@uptodate/types';
import mongoose from 'mongoose';

export const UptodateAccountSchema = new mongoose.Schema<UptodateAccount>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    errorMessage: { type: String, required: false },
    status: { type: String, enum: UptodateAccountStatus, required: false },
    loginAt: { type: Date },
    blockedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);
