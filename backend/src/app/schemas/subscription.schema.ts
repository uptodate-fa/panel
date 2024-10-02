import { Subscription } from '@uptodate/types';
import mongoose, { Types } from 'mongoose';

export const SubscriptionSchema = new mongoose.Schema<Subscription>(
  {
    expiredAt: { type: Date, required: true },
    maxActiveDevices: { type: Number, required: true, default: 1 },
    user: { type: Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  },
);
