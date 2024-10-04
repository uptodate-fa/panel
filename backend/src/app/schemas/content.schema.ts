import { Content } from '@uptodate/types';
import mongoose, { Types } from 'mongoose';

export const ContentSchema = new mongoose.Schema<Content>(
  {
    uptodateId: { type: String, required: true },
    queryStringId: { type: String, required: true },
    title: { type: String, required: true },
    bodyHtml: { type: String, required: true },
    outlineHtml: { type: String, required: true },
    translatedOutlineHtml: { type: String },
    translatedBodyHtml: { type: String },
    translatedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);
