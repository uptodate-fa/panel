import { User, UserRole } from '@uptodate/types';
import mongoose, { Schema } from 'mongoose';

export const UserSchema = new mongoose.Schema<User>(
  {
    firstName: { type: String },
    lastName: { type: String },
    birthDate: { type: Date },
    email: { type: String },
    username: { type: String, required: false },
    password: { type: String, required: false },
    job: { type: String },
    city: { type: String },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: UserRole, default: UserRole.User },
    subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
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
