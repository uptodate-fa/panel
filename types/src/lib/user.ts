import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
}

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  _id: any;
  id: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.User })
  role: UserRole;

  token?: string;
  exp?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
