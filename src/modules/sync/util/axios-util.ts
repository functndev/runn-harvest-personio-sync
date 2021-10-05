import { pipe } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { timeoutRetryStrategy } from '../../../util/request';

export const treatAxiosResponse = <T extends { data: unknown }>() =>
	pipe(timeoutRetryStrategy<T>(), pluck('data'));
