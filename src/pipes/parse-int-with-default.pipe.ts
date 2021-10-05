import { PipeTransform } from '@nestjs/common';

export class ParseIntWithDefaultPipe implements PipeTransform<string | number, number> {
	private readonly defaultValue: number;

	constructor(options: { defaultValue: number }) {
		this.defaultValue = options.defaultValue;
	}

	transform(value: string | number): number {
		const parsed = parseInt(`${value}`);

		if (isNaN(parsed)) return this.defaultValue;

		return parsed;
	}
}
