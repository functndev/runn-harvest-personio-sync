import { Injectable } from '@nestjs/common';

export type AppStatus = {
	status: string;
	startedAt: string;
};

@Injectable()
export class AppService {
	private readonly startedAt = new Date();

	getStatus(): AppStatus {
		return {
			status: 'ok',
			startedAt: this.startedAt.toISOString(),
		};
	}
}
