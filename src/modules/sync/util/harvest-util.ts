import type {
	HarvestPaginatedResponse,
	HarvestPaginationReqParams,
} from '../types/harvest.types';

import { EMPTY, Observable } from 'rxjs';
import { expand, reduce } from 'rxjs/operators';

export const fetchAllFromHarvestPaginatedResponse = <Data, Key extends string>(
	obsCreator: (
		params?: HarvestPaginationReqParams,
	) => Observable<HarvestPaginatedResponse<Data, Key>>,
	key: keyof HarvestPaginatedResponse<Data, Key>,
	paginationConfig?: { per_page?: number },
) =>
	obsCreator(paginationConfig).pipe(
		expand<
			HarvestPaginatedResponse<Data, Key>,
			Observable<HarvestPaginatedResponse<Data, Key>>
		>(({ next_page }) =>
			next_page ? obsCreator({ ...paginationConfig, page: next_page }) : EMPTY,
		),
		reduce((acc, { [key]: data }) => acc.concat(data), new Array<Data>()),
	);
