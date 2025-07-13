import { Payment } from '@uptodate/types';
import mongoose, { Types } from 'mongoose';

export const PaymentSchema = new mongoose.Schema<Payment>(
  {
    token: { type: String, required: true },
    description: { type: String },
    errorText: { type: String },
    amount: { type: Number, required: true },
    success: { type: Boolean, default: false },
    data: { type: Map },
    user: { type: Types.ObjectId, ref: 'User', required: true },
    origin: { type: String, default: '' },
  },
  {
    timestamps: true,
  },
);
