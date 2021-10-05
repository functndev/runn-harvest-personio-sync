import type { Interval } from 'date-fns';

import {
	parseISO,
	subYears,
	addDays,
	isSameDay,
	format,
	isWeekend,
	isValid,
	subDays,
} from 'date-fns/fp';
import { pipe } from 'ramda';

export type ModifyWeekType = 'future' | 'past';

export const dateFormatter = format('yyyy-MM-dd');

const getDateModifier = (type: ModifyWeekType) => (type === 'past' ? subDays : addDays);

const modifyDays = (type: ModifyWeekType, span: number) =>
	getDateModifier(type)(span, new Date());

export const getFormattedDate = (type: ModifyWeekType, span?: number) =>
	pipe(modifyDays, dateFormatter)(type, span || 120);

type GetIntervalConfig = {
	start_date: string;
	end_date: string | null;
};

const stripTZInfo = (date: string) =>
	date.includes('T') ? date.substr(0, date.indexOf('T')) : date;

const parseDateWithoutTZ = pipe(stripTZInfo, parseISO);

export const getInterval = ({ start_date, end_date }: GetIntervalConfig): Interval => ({
	start: parseDateWithoutTZ(start_date),
	end: parseDateWithoutTZ(end_date || start_date),
});

/*
 * Create a date that is 100 years in the past to create a default date that is
 * obviously invalid */
export const getStoneage = () => subYears(100, new Date());

export const getDateOrStoneage = (maybeDate: Date | undefined) =>
	maybeDate || subYears(100, new Date());

export const addOneDay = addDays(1);

export const saveAddOneDay = pipe(getDateOrStoneage, addOneDay);

export const isPrevDayBeforeCurrDay = (prevDay: Date | undefined, currDay: Date) =>
	isSameDay(saveAddOneDay(prevDay), currDay);

export const isNotWeekend = (day: Date) => !isWeekend(day);

export const isDateStringValid = pipe(parseISO, isValid);
