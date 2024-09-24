import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

export enum RedisKey {
  SessionId = 'sessionId',
}

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;

  constructor() {
    if (process.env.REDIS_URI)
      this.redisClient = new Redis(process.env.REDIS_URI);
  }

  get client() {
    return this.redisClient;
  }

  get sessionId() {
    return this.client.get(RedisKey.SessionId);
  }

  setSessionId(value: string) {
    this.client.set(RedisKey.SessionId, value);
  }
}
