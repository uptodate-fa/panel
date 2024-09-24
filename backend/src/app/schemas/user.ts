import { User, UserRole } from '@uptodate/types';
import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema<User>({
  phone: {type: String, required: true, unique: true},
  role: {type: String, enum: UserRole, default: UserRole.User}
}, {
  timestamps: true
})
