import { Subscription } from '@uptodate/types';
import mongoose from 'mongoose';

export const SubscriptionSchema = new mongoose.Schema<Subscription>(
  {
    expiredAt: { type: Date, required: true },
    maxActiveDevices: { type: Number, required: true, default: 1 },
  },
  {
    timestamps: true,
  },
);
