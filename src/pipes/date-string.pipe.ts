import type { Nullable } from '../types/helper.types';

import { BadRequestException, Optional } from '@nestjs/common';
import { isDateStringValid } from '../util/date-format';
import { BaseParsePipe } from './base.pipe';
import { ParseOptionalPipeOptions } from '../types/pipe.types';

export type InputType = string | undefined;

const dateRegex = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;

export class DateStringPipe extends BaseParsePipe<InputType, Nullable<string>> {
	constructor(@Optional() options?: ParseOptionalPipeOptions) {
		super(options);
	}

	transform(value: InputType): Nullable<string> {
		if (value === undefined && this.optional) return null;

		if (!value || !dateRegex.test(value) || !isDateStringValid(value))
			throw new BadRequestException('Invalid date string. Format: yyyy-MM-dd');

		return value;
	}
}
