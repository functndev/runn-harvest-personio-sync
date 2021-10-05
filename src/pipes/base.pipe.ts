import type { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import type { Nullable } from '../types/helper.types';
import type { ParseOptionalPipeOptions } from '../types/pipe.types';

import { Optional } from '@nestjs/common';

export abstract class BaseParsePipe<Input, Output>
	implements PipeTransform<Input, Nullable<Output>>
{
	protected readonly optional: boolean;

	protected constructor(@Optional() options?: ParseOptionalPipeOptions) {
		this.optional = options?.optional || false;
	}

	abstract transform(value: Input, metadata: ArgumentMetadata): Nullable<Output>;
}
