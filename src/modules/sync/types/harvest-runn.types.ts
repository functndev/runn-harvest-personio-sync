import type { RunnPerson } from './runn.types';
import type { HarvestPerson } from './harvest.types';
import { HarvestTimesheetsProject } from './harvest.types';
import { RunnProject } from './runn.types';

export type HarvestRunnPersonData = Record<
	string /* Harvest Person ID */,
	{ runnPerson: RunnPerson; harvestPerson: HarvestPerson }
>;

export type PeopleData = {
	runnToPersonioIdMap: Record<string, number>;
	harvestRunnPersonMap: HarvestRunnPersonData;
};

export type HarvestRunnProjectMap = Record<
	string /* Harvest project ID */,
	{ harvest: HarvestTimesheetsProject[]; runn: RunnProject }
>;

export type ProjectData = {
	runnToPersonioIdMap: Record<string, number>;
	harvestRunnProjectMap: HarvestRunnProjectMap;
};

export type TimeSheetData = {
	billableHours: number;
	nonBillableHours: number;
};

export type DateTimeSheetDataMap = Record<string /*dateString*/, TimeSheetData>;

export type PersonDateTimeSheetDataMap = Record<
	string /* Harvest Person ID */,
	DateTimeSheetDataMap
>;

export type ProjectPersonDateTimeSheetMap = Record<
	string /* Harvest Project ID */,
	PersonDateTimeSheetDataMap
>;

export type PeopleProjectData = {
	peopleData: PeopleData;
	projectData: ProjectData;
};
