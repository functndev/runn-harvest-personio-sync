import type { TimeSheetSyncReq } from '../../../../types/dtos/req/time-sheet-sync-req.interface';

import { IsNumber, IsOptional, IsPositive, Max } from 'class-validator';

export class TimeSheetSyncReqDto implements TimeSheetSyncReq {
	@IsOptional()
	@IsNumber()
	@IsPositive()
	@Max(240)
	daySpan?: number;
}
