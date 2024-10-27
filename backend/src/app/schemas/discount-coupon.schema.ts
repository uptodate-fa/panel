import { DiscountCoupon } from '@uptodate/types';
import mongoose, { Types } from 'mongoose';

export const DiscountCouponSchema = new mongoose.Schema<DiscountCoupon>(
  {
    code: { type: String, required: true, unique: true, },
    percentageValue: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
    user: { type: Types.ObjectId, ref: 'User', required: false },
    expiredAt: { type: Date },
  },
  {
    timestamps: true,
  },
);
