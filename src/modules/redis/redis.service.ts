import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
	private readonly logger = new Logger(RedisService.name);
	private readonly redis: Redis.Redis;

	constructor(config: ConfigService) {
		this.logger.log('connecting to redis: ' + config.get<string>('REDIS_HOST'));
		this.redis = new Redis({
			port: 6379,
			host: config.get<string>('REDIS_HOST'),
			password: config.get<string>('REDIS_PASSWORD'),
			db: 0,
		});
	}

	public getRedisStatus() {
		return this.redis.status;
	}
}
