import { UserDevice } from '@uptodate/types';
import mongoose, { Types } from 'mongoose';

export const UserDeviceSchema = new mongoose.Schema<UserDevice>(
  {
    userAgent: { type: String },
    token: { type: Number },
    isExpired: { type: Boolean, default: false },
    user: { type: Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  },
);
