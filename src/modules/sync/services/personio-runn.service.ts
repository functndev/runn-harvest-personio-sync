import type { RunnTimeOff } from '../types/runn.types';
import type {
	AccumulatedVal,
	CheckedTimeOffsParameters,
	OverlappingInvervalProps,
} from '../types/personio-runn.types';
import type { PersonioTimeOffData } from '../types/personio.types';
import { TimeOffSyncReqInterface } from '../../../types/dtos/req/time-off-sync-req.interface';

import { Injectable } from '@nestjs/common';
import {
	catchError,
	combineLatest,
	defaultIfEmpty,
	EMPTY,
	forkJoin,
	from,
	of,
	pipe,
	throwError,
} from 'rxjs';
import {
	filter,
	map,
	mergeAll,
	mergeMap,
	pluck,
	reduce,
	tap,
	toArray,
} from 'rxjs/operators';
import { eachDayOfInterval } from 'date-fns/fp';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { PersonioService } from './personio.service';
import { RunnService } from './runn.service';
import { mergeWithLatest } from '../../../util/custom-operators';
import { dateFormatter, isNotWeekend } from '../../../util/date-format';
import {
	accessConnectionMap,
	addPersonioTimeOffInterval,
	getFilteredPersonioTimeOffStream,
	getRosteredTimeOffIntervals,
	runnPersonioOverlappingTimeEntries,
	runnTimeOffType,
	singleDaysToConnectedIntervals,
	toCheckedInputParams,
	toDaysWithoutRosteredDaysOff,
	toPeopleIdMapWithData,
} from '../util/personio-runn-util';

@Injectable()
export class PersonioRunnService {
	constructor(
		private readonly personioService: PersonioService,
		private readonly runnService: RunnService,
		@InjectPinoLogger(PersonioRunnService.name)
		private readonly pinoLogger: PinoLogger,
	) {}

	// in this case we need to use the object type - otherwise rxjs types break
	// eslint-disable-next-line @typescript-eslint/ban-types
	private readonly tapDebugLog = <K extends object>(
		additionalLog: string,
		additionalData?: Record<string, unknown>,
	) => tap<K>((data) => this.pinoLogger.debug({ data, additionalData }, additionalLog));

	// in this case we need to use the object type - otherwise rxjs types break
	// eslint-disable-next-line @typescript-eslint/ban-types
	private readonly debugData = <T extends object>(
		message: string,
		data: OverlappingInvervalProps,
	) => this.tapDebugLog<T>(message, data.personioTimeOff.employee);

	private readonly deleteExistingSyncedRunnTimeOffs = ({
		runnTimeOffs,
	}: AccumulatedVal) =>
		from(runnTimeOffs).pipe(
			filter(runnTimeOffType('leave')),
			mergeMap(this.runnService.deleteRunnTime),
			defaultIfEmpty(EMPTY),
			toArray(),
		);

	private readonly getFilteredDays = (data: OverlappingInvervalProps) =>
		pipe(
			filter(runnPersonioOverlappingTimeEntries(data)),
			this.debugData('Personio Runn Overlapping Time entries', data),
			reduce(toDaysWithoutRosteredDaysOff, eachDayOfInterval(data.personioInterval)),
			mergeAll(),
			filter(isNotWeekend),
			toArray(),
			this.debugData('Overlapping days without rostered days off (w/o weekend)', data),
		);

	private readonly createNonClashingRunnTimeOffIntervals =
		(data: AccumulatedVal) =>
		([runnTimeOffIntervals, personioTimeOff, personioInterval]: Readonly<
			[{ runnPersonId: string; runnInterval: Interval }[], PersonioTimeOffData, Interval]
		>) =>
			from(runnTimeOffIntervals).pipe(
				this.getFilteredDays({ personioInterval, personioTimeOff, ...data }),
				map(singleDaysToConnectedIntervals),
				pluck('intervals'),
				mergeAll(),
				map((interval) => ({ interval, employee: personioTimeOff.employee })),
			);

	private readonly addSyncedRunnTimeOffs = (data: AccumulatedVal) =>
		// smart usage of combine latest:
		combineLatest([
			getRosteredTimeOffIntervals(data), // Observable of 1 single array
			getFilteredPersonioTimeOffStream(data), // stream of time off data
			// --> full runnIntervals [] + single personio time off data
		]).pipe(
			map(addPersonioTimeOffInterval),
			mergeMap(this.createNonClashingRunnTimeOffIntervals(data)),
			mergeMap(({ interval: { start, end }, employee }) => {
				const connectionPair = accessConnectionMap(data.personioConnectionMap)(employee);

				return connectionPair
					? this.runnService.addRunnTimeOff({
							start_date: dateFormatter(start),
							end_date: dateFormatter(end || start),
							person_id: connectionPair.runnId,
					  })
					: EMPTY;
			}),
			reduce(
				(acc, val) => {
					return 'message' in val
						? { ...acc, errors: acc.errors.concat(val) }
						: { ...acc, success: acc.success.concat(val) };
				},
				{ success: [], errors: [] } as {
					success: RunnTimeOff[];
					errors: unknown[];
				},
			),
		);

	private readonly fetchPersonAndRunnData = (params: CheckedTimeOffsParameters) =>
		forkJoin({
			runnTimeOffs: this.runnService.getTimeOffs(),
			personioPeople: this.personioService.getPeople(),
			personioTimeOffs: this.personioService.getTimeOffs(params),
		});

	private readonly getFormattedReturnData = <Data extends AccumulatedVal, Deletions>([
		data,
		deletions,
	]: [Data, Deletions]) =>
		forkJoin({
			deletions: of(deletions),
			additions: this.addSyncedRunnTimeOffs(data),
		});

	private readonly logParams = (params: TimeOffSyncReqInterface) =>
		this.pinoLogger.debug({ apiParams: params }, 'Used API parameters');

	public readonly syncPersonioLeaveTimes = (params: TimeOffSyncReqInterface) =>
		of(params).pipe(
			tap(this.logParams),
			map(toCheckedInputParams),
			mergeMap(this.fetchPersonAndRunnData),
			mergeWithLatest(this.runnService.getPeopleStream),
			reduce(toPeopleIdMapWithData, {} as AccumulatedVal),
			mergeWithLatest(this.deleteExistingSyncedRunnTimeOffs),
			mergeMap(this.getFormattedReturnData),
			catchError((err) => {
				this.pinoLogger.error(err);
				return throwError(err);
			}),
		);
}
