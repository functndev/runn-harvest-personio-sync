import { Body, Controller, Post } from '@nestjs/common';

import { PersonioRunnService } from '../services/personio-runn.service';
import { HarvestRunnService } from '../services/harvest-runn.service';
import { TimeSheetSyncReqDto } from '../dtos/req/time-sheet-sync-req.dto';
import { TimeOffSyncReqDto } from '../dtos/req/time-off-sync-req.dto';

@Controller('sync')
export class SyncController {
	constructor(
		private readonly personioRunnService: PersonioRunnService,
		private readonly harvestRunnService: HarvestRunnService,
	) {}

	@Post('time-off')
	public syncPersonioLeaveTimes(@Body() reqParams: TimeOffSyncReqDto) {
		return this.personioRunnService.syncPersonioLeaveTimes(reqParams);
	}

	@Post('time-sheets')
	public syncHarvest(@Body() reqParams: TimeSheetSyncReqDto) {
		return this.harvestRunnService.syncHarvestTimesheets(reqParams);
	}
}
