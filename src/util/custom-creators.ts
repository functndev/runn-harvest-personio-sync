import type { Observable } from 'rxjs';

import { mergeAll } from 'rxjs/operators';

export const obsArrayToStream = <T>(val: Observable<T[]>): Observable<T> =>
	val.pipe(mergeAll());
