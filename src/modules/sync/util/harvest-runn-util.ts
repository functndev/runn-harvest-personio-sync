import type { RunnPerson, RunnProject } from '../types/runn.types';
import type {
	HarvestPerson,
	HarvestTimeSheet,
	HarvestTimesheetsProject,
} from '../types/harvest.types';
import type {
	ProjectPersonDateTimeSheetMap,
	DateTimeSheetDataMap,
	PersonDateTimeSheetDataMap,
	PeopleData,
	ProjectData,
} from '../types/harvest-runn.types';

import { combineLatest, from, of } from 'rxjs';

import { entriesOf, reversedEntriesOf } from '../../../util/common-util';

export const getEmptyPeopleData = (): PeopleData => ({
	harvestRunnPersonMap: {},
	runnToPersonioIdMap: {},
});

export const toPeopleData = (
	acc: PeopleData,
	[runnPeopleMap, harvestPerson]: [Record<string, RunnPerson>, HarvestPerson],
): PeopleData => {
	const runnPerson = runnPeopleMap[harvestPerson.email];
	return runnPerson
		? {
				runnToPersonioIdMap: {
					...acc.runnToPersonioIdMap,
					[runnPerson.id]: harvestPerson.id,
				},
				harvestRunnPersonMap: {
					...acc.harvestRunnPersonMap,
					[harvestPerson.id.toString()]: { runnPerson, harvestPerson },
				},
		  }
		: acc;
};

export const getEmptyProjectData = (): ProjectData => ({
	harvestRunnProjectMap: {},
	runnToPersonioIdMap: {},
});

export const toHarvestRunnProjectMap = (
	acc: ProjectData,
	[runnProjectMap, harvestProject]: [
		Record<string, RunnProject>,
		HarvestTimesheetsProject,
	],
): ProjectData => {
	const runnProject = runnProjectMap[harvestProject.code];
	const accObject = acc.harvestRunnProjectMap[harvestProject.code];

	if (!runnProject) return acc;

	return {
		runnToPersonioIdMap: {
			...acc.runnToPersonioIdMap,
			[runnProject.id]: harvestProject.id,
		},
		harvestRunnProjectMap: {
			...acc.harvestRunnProjectMap,
			[harvestProject.id?.toString()]: {
				harvest: accObject?.harvest?.length
					? accObject.harvest.concat(harvestProject)
					: [harvestProject],
				runn: runnProject,
			},
		},
	};
};

export const toAccumulatedPersonDateMap = (
	acc: ProjectPersonDateTimeSheetMap,
	{
		user: { id: harvestPersonId },
		spent_date,
		billable,
		rounded_hours,
		project: { id: harvestProjectId },
	}: HarvestTimeSheet,
): ProjectPersonDateTimeSheetMap => {
	const key = billable ? 'billableHours' : 'nonBillableHours';
	const timeSheetInfo = acc[harvestProjectId]?.[harvestPersonId]?.[spent_date] || {
		nonBillableHours: 0,
		billableHours: 0,
	};

	return {
		...acc,
		[harvestProjectId?.toString()]: {
			...acc[harvestProjectId],
			[harvestPersonId?.toString()]: {
				...acc[harvestProjectId]?.[harvestPersonId],
				[spent_date]: {
					...timeSheetInfo,
					[key]: timeSheetInfo[key] + rounded_hours,
				},
			},
		},
	};
};

export const projectIdWithEntriesOfPersonDateTimeSheetMap = ([
	projecdId,
	personDateTimeSheetMap,
]: [string, PersonDateTimeSheetDataMap]) =>
	combineLatest([of(projecdId), from(entriesOf(personDateTimeSheetMap))]);

export const personAndProjectIdWithReversedDateTimeSheetMap = ([
	projectId,
	[personId, data],
]: [string, [string, DateTimeSheetDataMap]]) =>
	combineLatest([of(projectId), of(personId), from(reversedEntriesOf(data))]);
