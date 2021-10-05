import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

export type AppStatus = {
  status: string;
  redis: string;
  startedAt: string;
};

@Injectable()
export class AppService {
  private startedAt: Date;

  constructor(private readonly redisService: RedisService) {
    this.startedAt = new Date();
  }

  getStatus(): AppStatus {
    return {
      status: 'ok',
      redis: this.redisService.getRedisStatus(),
      startedAt: this.startedAt.toISOString(),
    };
  }
}
