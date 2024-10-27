import { ContentHistory } from '@uptodate/types';
import mongoose, { Types } from 'mongoose';

export const ContentHistorySchema = new mongoose.Schema<ContentHistory>(
  {
    content: { type: Types.ObjectId, ref: 'Content', required: true },
    user: { type: Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  },
);
