import type { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs';
import type { StringPropsOfType } from '../types/helper.types';
import type { IndexType } from '../types/common.types';

import { combineLatest, delay, Observable, of, retryWhen } from 'rxjs';
import { mergeMap, reduce } from 'rxjs/operators';
import { add1, sub1 } from './math';

export const mergeWithLatest = <T, K>(
	getStream: (val: T) => Observable<K>,
	concurrency: number = Number.POSITIVE_INFINITY,
): OperatorFunction<T, [T, K]> =>
	mergeMap((val: T) => combineLatest([of(val), getStream(val)]), concurrency);

export const retryWithBackoff = <T>({
	times = 3,
	backoffMs = 1000,
	logger = console,
}: {
	times?: number;
	backoffMs?: number;
	logger?: { error: (...args: unknown[]) => void };
}): MonoTypeOperatorFunction<T> =>
	retryWhen((errors) =>
		errors.pipe(
			mergeMap((error, i) => {
				logger?.error(`ERROR [#${add1(i)}]: ${error}. Retrying...`);
				if (i >= sub1(times)) throw error;
				return of(error).pipe(delay(add1(i) * backoffMs));
			}),
		),
	);

export const reduceKeyToMap = <T>(key: StringPropsOfType<T>) =>
	reduce(
		(acc, val: T) => ({ ...acc, [val[key] as unknown as IndexType]: val }),
		{} as Record<string, T>,
	);
