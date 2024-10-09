import { Log } from '@uptodate/types';
import mongoose, { Types } from 'mongoose';

export const LogSchema = new mongoose.Schema<Log>(
  {
    key: { type: String, required: true },
    description: { type: String },
    user: { type: Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  },
);
