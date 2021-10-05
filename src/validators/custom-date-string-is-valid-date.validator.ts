import type { ValidationOptions, ValidatorConstraintInterface } from 'class-validator';

import { registerDecorator, ValidatorConstraint } from 'class-validator';
import { isDateStringValid } from '../util/date-format';

@ValidatorConstraint()
class CustomDateStringIsValidConstraint implements ValidatorConstraintInterface {
	validate(value: unknown): boolean {
		return typeof value === 'string' && isDateStringValid(value);
	}
}

export function CustomDateStringIsValidDate(validationOptions?: ValidationOptions) {
	// in this case we can safely turn off the lint rule, as the decorator does
	// not care about the object at all
	// eslint-disable-next-line @typescript-eslint/ban-types
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: { message: 'Date string is not valid', ...validationOptions },
			validator: CustomDateStringIsValidConstraint,
		});
	};
}
