import type { UnaryFunction } from 'rxjs';

import { Observable, pipe } from 'rxjs';
import { mergeAll, pluck, toArray } from 'rxjs/operators';

import { timeoutRetryStrategy } from '../../../util/request';

export const pluckPersonioResponseAttributes = <
	T extends { data: { data: { attributes: unknown }[] } },
>(): UnaryFunction<
	Observable<T>,
	Observable<T['data']['data'][number]['attributes'][]>
> =>
	pipe(
		pluck<T, 'data'>('data'),
		pluck('data'),
		mergeAll(),
		pluck('attributes'),
		toArray(),
	);

export const treatPersonioResponse = <
	T extends { data: { data: { attributes: unknown }[] } },
>() => pipe(timeoutRetryStrategy<T>(), pluckPersonioResponseAttributes());
