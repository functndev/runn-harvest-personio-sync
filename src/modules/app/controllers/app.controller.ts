import { Controller, Get } from '@nestjs/common';
import { AppService, AppStatus } from '../services/app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('/')
	getStatus(): AppStatus {
		return this.appService.getStatus();
	}
}
