import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule],
  exports: [RedisService],
  providers: [RedisService],
})
export class RedisModule {}
