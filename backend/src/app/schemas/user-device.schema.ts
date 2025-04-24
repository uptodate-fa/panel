import { UserDevice } from '@uptodate/types';
import mongoose, { Types } from 'mongoose';

export const UserDeviceSchema = new mongoose.Schema<UserDevice>(
  {
    hash: { type: String, required: true },
    saveLogin: { type: Boolean, default: false },
    userAgent: { type: String },
    token: { type: Number },
    isExpired: { type: Boolean, default: false },
    user: { type: Types.ObjectId, ref: 'User', required: true },
    connectionAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  },
);
