import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class SafeConfigService {
	constructor(private readonly configService: NestConfigService) {}

	public getStringOrError(key: string): string {
		const value = this.configService.get<unknown>(key);
		if (!value) throw Error(`Key [${key}] not defined in process.env`);
		if (typeof value !== 'string') throw Error(`Key [${key}] must be of type string`);
		return value;
	}

	public getNumberOrError(key: string): number {
		const value = this.configService.get<unknown>(key);
		if (!value) throw Error(`Key [${key}] not defined in process.env`);
		if (typeof value !== 'number') throw Error(`Key [${key}] must be of type number`);
		return value;
	}
}
