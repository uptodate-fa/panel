import { Content } from '@uptodate/types';
import mongoose, { Types } from 'mongoose';

export const ContentSchema = new mongoose.Schema<Content>(
  {
    uptodateId: { type: String, required: true },
    queryStringId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    bodyHtml: { type: String, required: true },
    outlineHtml: { type: String, required: true },
    translatedOutlineHtml: { type: String },
    translatedBodyHtml: { type: String },
    translatedAt: { type: Date },
    relatedGraphics: [
      {
        title: { type: String, required: true },
        imageKey: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  },
);
