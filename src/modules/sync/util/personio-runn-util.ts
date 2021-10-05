import type { PersonioPersonData, PersonioTimeOffData } from '../types/personio.types';
import type { RunnPerson, RunnTimeOff } from '../types/runn.types';
import type {
	AccumulatedVal,
	NewPerson,
	OverlappingInvervalProps,
	CheckedTimeOffsParameters,
} from '../types/personio-runn.types';

import { from } from 'rxjs';
import { filter, map, toArray } from 'rxjs/operators';
import { areIntervalsOverlapping, eachDayOfInterval, isSameDay } from 'date-fns/fp';
import { BadRequestException } from '@nestjs/common';

import {
	getInterval,
	getStoneage,
	isPrevDayBeforeCurrDay,
} from '../../../util/date-format';
import { sub1 } from '../../../util/math';
import { TimeOffSyncReqInterface } from '../../../types/dtos/req/time-off-sync-req.interface';

export const toPeopleIdMapWithData = (
	acc: AccumulatedVal,
	[{ personioPeople, personioTimeOffs, runnTimeOffs }, runnPerson]: [
		{
			personioPeople: PersonioPersonData[];
			personioTimeOffs: PersonioTimeOffData[];
			runnTimeOffs: RunnTimeOff[];
		},
		RunnPerson,
	],
) => {
	const foundPerson = personioPeople.find(
		({ email: { value } }) => value === runnPerson.email,
	);

	if (!foundPerson) return acc;

	const newPerson: NewPerson = {
		runnId: runnPerson.id,
		personioId: foundPerson.id.value,
		email: foundPerson.email.value,
	};

	return {
		personioConnectionMap: {
			...(acc.personioConnectionMap || {}),
			[newPerson.personioId]: newPerson,
		},
		runnTimeOffs: acc.runnTimeOffs || runnTimeOffs,
		personioPeople: acc.personioPeople || personioPeople,
		personioTimeOffs: acc.personioTimeOffs || personioTimeOffs,
	};
};

export const runnTimeOffType =
	(givenType: 'rdo' | 'leave') =>
	({ type }: RunnTimeOff) =>
		givenType === type;

const halfDayOffs = ({ days_count }: PersonioTimeOffData) => days_count >= 1;

const nonApprovedEntries = ({ status }: PersonioTimeOffData) => status === 'approved';

export const getRosteredTimeOffIntervals = ({ runnTimeOffs }: AccumulatedVal) =>
	from(runnTimeOffs).pipe(
		filter(runnTimeOffType('rdo')),
		map((data) => ({ runnPersonId: data.person_id, runnInterval: getInterval(data) })),
		toArray(),
	);

export const accessConnectionMap =
	(connectionMap: Record<string, NewPerson>) =>
	(data: PersonioTimeOffData | PersonioTimeOffData['employee']) =>
		connectionMap[
			'employee' in data
				? `${data.employee.attributes.id.value}`
				: `${data.attributes.id.value}`
		];

const peopleNotExistingInRunn =
	(connectionMap: Record<string, NewPerson>) => (data: PersonioTimeOffData) =>
		!!accessConnectionMap(connectionMap)(data);

export const getFilteredPersonioTimeOffStream = ({
	personioTimeOffs,
	personioConnectionMap,
}: AccumulatedVal) =>
	from(personioTimeOffs).pipe(
		filter(halfDayOffs),
		filter(peopleNotExistingInRunn(personioConnectionMap)),
		filter(nonApprovedEntries),
	);

const getInitialIntervalReduceState = (): {
	currentInterval: Interval;
	intervals: Interval[];
} => ({
	currentInterval: { start: getStoneage(), end: getStoneage() },
	intervals: [],
});

const existsRunnPerson = (
	personioConnectionMap: Record<string, NewPerson>,
	personioTimeOff: PersonioTimeOffData,
	runnPersonId: string,
) => accessConnectionMap(personioConnectionMap)(personioTimeOff)?.runnId === runnPersonId;

export const runnPersonioOverlappingTimeEntries =
	({
		personioInterval,
		personioConnectionMap,
		personioTimeOff,
	}: OverlappingInvervalProps) =>
	({ runnInterval, runnPersonId }: { runnInterval: Interval; runnPersonId: string }) =>
		areIntervalsOverlapping(runnInterval, personioInterval) &&
		existsRunnPerson(personioConnectionMap, personioTimeOff, runnPersonId);

export const toDaysWithoutRosteredDaysOff = (
	acc: Date[],
	{ runnInterval }: { runnInterval: Interval },
) => acc.filter((day) => !eachDayOfInterval(runnInterval).find(isSameDay(day)));

export const addPersonioTimeOffInterval = ([runnTimeOffIntervals, personioTimeOff]: [
	{ runnPersonId: string; runnInterval: Interval }[],
	PersonioTimeOffData,
]) => [runnTimeOffIntervals, personioTimeOff, getInterval(personioTimeOff)] as const;

export const singleDaysToConnectedIntervals = (days: Date[]) =>
	days.reduce(
		(acc, currDay, index, days) =>
			// the first element gets a special treatment
			index <= 0
				? {
						intervals:
							// if there is only one day in total we add it to the
							// intervals
							days.length <= 1 ? [{ start: currDay, end: currDay }] : [],
						currentInterval: { start: currDay, end: currDay },
				  }
				: isPrevDayBeforeCurrDay(days[sub1(index)], currDay)
				? // check if the prev day is one before the current day to
				  // determine if we can create an interval
				  {
						intervals:
							// if we are on the last element we need to add the
							// current interval as we cannot iterate anymore
							index === sub1(days.length)
								? acc.intervals.concat({
										...acc.currentInterval,
										end: currDay,
								  })
								: acc.intervals,
						currentInterval: { ...acc.currentInterval, end: currDay },
				  }
				: {
						// if the current day is *NOT* before the prev day we
						// know, that we have to create a new interval and flush
						// the current interval into the intervals array
						intervals: acc.intervals.concat(acc.currentInterval),
						currentInterval: { start: currDay, end: currDay },
				  },
		getInitialIntervalReduceState(),
	);

export const toCheckedInputParams = ({
	start,
	end,
	daySpan = 120,
}: TimeOffSyncReqInterface): CheckedTimeOffsParameters => {
	if ((start || end) && daySpan)
		throw new BadRequestException(
			'You cannot define a date range and a timespan at the same time',
		);

	if ((!start && end) || (start && !end))
		throw new BadRequestException('You must provide a start AND end date.');

	return start && end ? { start, end } : { daySpan };
};
