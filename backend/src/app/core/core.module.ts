import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { TopicAssetsSqliteService } from './topic-assets-sqlite.service';

@Module({
  providers: [RedisService, TopicAssetsSqliteService],
  exports: [RedisService, TopicAssetsSqliteService],
})
export class CoreModule {}
