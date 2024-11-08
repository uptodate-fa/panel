import { Content } from './content';
import { User } from './user';

export class ContentHistory {
  _id: string;
  content: Content;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}
