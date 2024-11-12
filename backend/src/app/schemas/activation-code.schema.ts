import { ActivationCode } from '@uptodate/types';
import mongoose from 'mongoose';

export const ActivationCodeSchema = new mongoose.Schema<ActivationCode>(
  {
    period: { type: Number, required: true },
    maxActiveDevices: { type: Number, required: true },
    codes: { type: [String], default: [] },
    expiredAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  },
);
