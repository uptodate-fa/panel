import { User, UserRole } from '@uptodate/types';
import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema<User>(
  {
    firstName: { type: String },
    lastName: { type: String },
    birthDate: { type: Date },
    email: { type: String },
    job: { type: String },
    city: { type: String },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: UserRole, default: UserRole.User },
  },
  {
    timestamps: true,
  },
);

UserSchema.virtual('logs', {
  ref: 'Log',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});
