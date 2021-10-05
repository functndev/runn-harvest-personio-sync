import type { RunnPerson, RunnProject } from '../types/runn.types';
import type {
	HarvestPerson,
	HarvestProject,
	HarvestTimesheetsProject,
} from '../types/harvest.types';
import type {
	ProjectPersonDateTimeSheetMap,
	PeopleProjectData,
	TimeSheetData,
} from '../types/harvest-runn.types';
import type { TimeSheetSyncReq } from '../../../types/dtos/req/time-sheet-sync-req.interface';

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { forkJoin, from, of, EMPTY } from 'rxjs';
import {
	mergeMap,
	reduce,
	combineLatestWith,
	mergeAll,
	map,
	toArray,
	tap,
} from 'rxjs/operators';

import { HarvestService } from './harvest.service';
import { RunnService } from './runn.service';
import { reduceKeyToMap } from '../../../util/custom-operators';
import {
	getEmptyPeopleData,
	getEmptyProjectData,
	personAndProjectIdWithReversedDateTimeSheetMap,
	projectIdWithEntriesOfPersonDateTimeSheetMap,
	toAccumulatedPersonDateMap,
	toHarvestRunnProjectMap,
	toPeopleData,
} from '../util/harvest-runn-util';
import { getFormattedDate } from '../../../util/date-format';
import { entriesOf, valuesOf } from '../../../util/common-util';

@Injectable()
export class HarvestRunnService {
	constructor(
		private readonly harvestService: HarvestService,
		private readonly runnService: RunnService,
		@InjectPinoLogger(HarvestRunnService.name)
		private readonly pinoLogger: PinoLogger,
	) {}

	private readonly getHarvestTimeEntriesOfProject =
		({ daySpan }: TimeSheetSyncReq) =>
		({ id }: { id: number }) =>
			this.harvestService.getAllTimeEntries({
				project_id: id,
				from: getFormattedDate('past', daySpan),
			});

	private readonly enhanceProjectWithTimeEntries =
		(params: TimeSheetSyncReq) => (harvestProject: HarvestProject) =>
			of(harvestProject).pipe(
				mergeMap(this.getHarvestTimeEntriesOfProject(params)),
				map((timeEntries) => ({ ...harvestProject, timeEntries })),
			);

	private readonly getHarvestProjectsWithTimeEntries = (params: TimeSheetSyncReq) =>
		this.harvestService
			.getAllProjects()
			.pipe(mergeAll(), mergeMap(this.enhanceProjectWithTimeEntries(params)), toArray());

	private readonly calculateProjectData = (
		runnProjects: RunnProject[],
		harvestProjects: HarvestTimesheetsProject[],
	) =>
		from(runnProjects).pipe(
			reduceKeyToMap('id'),
			combineLatestWith(from(harvestProjects)),
			reduce(toHarvestRunnProjectMap, getEmptyProjectData()),
		);

	private readonly calculatePeopleData = (
		runnPeople: RunnPerson[],
		harvestPeople: HarvestPerson[],
	) =>
		from(runnPeople).pipe(
			reduceKeyToMap('email'),
			combineLatestWith(from(harvestPeople)),
			reduce(toPeopleData, getEmptyPeopleData()),
		);

	private readonly addActual =
		({ projectData, peopleData }: PeopleProjectData) =>
		([harvestProjectId, personId, [dateString, { nonBillableHours, billableHours }]]: [
			string,
			string,
			[string, TimeSheetData],
		]) => {
			const person = peopleData.harvestRunnPersonMap[personId];
			const project = projectData.harvestRunnProjectMap[harvestProjectId];

			return person && project
				? this.runnService.createActual({
						date: dateString,
						person_id: person.runnPerson.id,
						project_id: project.runn.id,
						role_id: person.runnPerson.role_id,
						billable_minutes: billableHours * 60,
						nonbillable_minutes: nonBillableHours * 60,
						billable_note: '@@harvest-runn-sync@@',
						nonbillable_note: '@@harvest-runn-sync@@',
				  })
				: EMPTY;
		};

	private readonly processHarvestRunnProjectMap = (data: PeopleProjectData) =>
		from(valuesOf(data.projectData.harvestRunnProjectMap)).pipe(
			mergeMap(({ harvest }) => harvest),
			mergeMap(({ timeEntries }) => timeEntries),
			reduce(toAccumulatedPersonDateMap, {} as ProjectPersonDateTimeSheetMap),
			tap((data) => this.pinoLogger.debug({ data }, 'reduceCheck')),
			mergeMap(entriesOf),
			mergeMap(projectIdWithEntriesOfPersonDateTimeSheetMap),
			mergeMap(personAndProjectIdWithReversedDateTimeSheetMap),
			mergeMap(this.addActual(data), 1),
		);

	public readonly syncHarvestTimesheets = (params: TimeSheetSyncReq) =>
		forkJoin({
			runnPeople: this.runnService.getPeople(),
			harvestPeople: this.harvestService.getAllPeople(),
			runnProjects: this.runnService.getProjects(),
			harvestProjects: this.getHarvestProjectsWithTimeEntries(params),
		}).pipe(
			mergeMap(({ runnProjects, harvestProjects, runnPeople, harvestPeople }) =>
				forkJoin({
					peopleData: this.calculatePeopleData(runnPeople, harvestPeople),
					projectData: this.calculateProjectData(runnProjects, harvestProjects),
				}),
			),
			mergeMap(this.processHarvestRunnProjectMap),
			toArray(),
		);
}
