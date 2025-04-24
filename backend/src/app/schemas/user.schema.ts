import { User, UserRole } from '@uptodate/types';
import mongoose, { Schema } from 'mongoose';

export const UserSchema = new mongoose.Schema<User>(
  {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    birthDate: { type: Date, required: false },
    email: { type: String, required: false },
    username: { type: String, required: false },
    password: { type: String, required: false },
    job: { type: String, required: false },
    city: { type: String, required: false },
    phone: { type: String, required: false, unique: true },
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
