import { pipe, timeout } from 'rxjs';
import { retryWithBackoff } from './custom-operators';

export const timeoutRetryStrategy = <T>() =>
	pipe(timeout<T>(5000), retryWithBackoff({ backoffMs: 5000, times: 3 }));
