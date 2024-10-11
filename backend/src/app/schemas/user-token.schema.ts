import { UserToken } from '@uptodate/types';
import mongoose, { Types } from 'mongoose';

export const UserTokenSchema = new mongoose.Schema<UserToken>(
  {
    token: { type: String },
    expired: { type: Boolean, default: false },
    user: { type: Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  },
);
