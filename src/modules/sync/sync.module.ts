import { Module } from '@nestjs/common';
import { PersonioRunnService } from './services/personio-runn.service';
import { SyncController } from './controllers/sync.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PersonioService } from './services/personio.service';
import { SafeConfigService } from './services/safe-config.service';
import { RunnService } from './services/runn.service';
import { HarvestService } from './services/harvest.service';
import { HarvestRunnService } from './services/harvest-runn.service';

@Module({
	imports: [HttpModule, ConfigModule],
	providers: [
		PersonioRunnService,
		PersonioService,
		RunnService,
		SafeConfigService,
		HarvestService,
		HarvestRunnService,
	],
	controllers: [SyncController],
})
export class SyncModule {}
