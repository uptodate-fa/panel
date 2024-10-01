import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, User } from '@uptodate/types';
import { UserSchema } from './user.schema';
import { LogSchema } from './log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Log.name, schema: LogSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SchemasModule {}
