import type { TimeOffSyncReqInterface } from '../../../../types/dtos/req/time-off-sync-req.interface';

import {
	IsOptional,
	IsString,
	Matches,
	IsNumber,
	IsPositive,
	Max,
} from 'class-validator';

import { CustomDateStringIsValidDate } from '../../../../validators/custom-date-string-is-valid-date.validator';

const dateRegex =
	/^\d{4}-?((((0[13578])|(1[02]))-?(([0-2][0-9])|(3[01])))|(((0[469])|(11))-?(([0-2][0-9])|(30)))|(02-?[0-2][0-9]))$/;

export class TimeOffSyncReqDto implements TimeOffSyncReqInterface {
	@IsOptional()
	@IsString()
	@Matches(dateRegex, { message: 'Date string must match YYYY-MM-DD' })
	@CustomDateStringIsValidDate()
	start?: string;

	@IsOptional()
	@IsString()
	@Matches(dateRegex, { message: 'Date string must match YYYY-MM-DD' })
	@CustomDateStringIsValidDate()
	end?: string;

	@IsOptional()
	@IsNumber()
	@IsPositive()
	@Max(240)
	daySpan?: number;

	/*@IsOptional()
	@IsArray()
	@IsString({ each: true })
	userIds?: string[];*/
}
