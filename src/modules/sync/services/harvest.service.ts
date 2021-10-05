import type {
	FetchAllPaginationParams,
	HarvestAxiosConfig,
	HarvestPaginationReqParams,
	HarvestPersonResponse,
	HarvestProjectResponse,
	HarvestTimeSheetsResponse,
} from '../types/harvest.types';
import type { AxiosRequestConfig } from 'axios';

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { mergeAll } from 'rxjs/operators';

import { SafeConfigService } from './safe-config.service';
import { treatAxiosResponse } from '../util/axios-util';
import { fetchAllFromHarvestPaginatedResponse } from '../util/harvest-util';

@Injectable()
export class HarvestService {
	private readonly accountID: string;
	private readonly accessToken: string;
	private readonly baseUrl: string;

	constructor(
		private readonly safeConfigService: SafeConfigService,
		private readonly httpService: HttpService,
		@InjectPinoLogger(HarvestService.name)
		private readonly pinoLogger: PinoLogger,
	) {
		this.accountID = safeConfigService.getStringOrError('HARVEST_ACCOUNT_ID');
		this.accessToken = safeConfigService.getStringOrError('HARVEST_ACCESS_TOKEN');
		this.baseUrl = safeConfigService.getStringOrError('HARVEST_BASE_URL');
	}

	private readonly getConfig = ({
		axiosConfig: { headers, params, ...rest } = {},
		paginationConfig: { page, per_page } = {},
	}: HarvestAxiosConfig = {}): AxiosRequestConfig => ({
		headers: {
			Authorization: `Bearer ${this.accessToken}`,
			'Harvest-Account-Id': this.accountID,
			...headers,
		},
		params: {
			page: page || 1,
			per_page: per_page || 100,
			...params,
		},
		...rest,
	});

	public readonly getPeople = (paginationConfig: HarvestPaginationReqParams = {}) =>
		this.httpService
			.get<HarvestPersonResponse>(
				`${this.baseUrl}/users`,
				this.getConfig({
					axiosConfig: { params: { is_active: true } },
					paginationConfig,
				}),
			)
			.pipe(treatAxiosResponse());

	public readonly getAllPeople = (params?: FetchAllPaginationParams) =>
		fetchAllFromHarvestPaginatedResponse(this.getPeople, 'users', params);

	public readonly getProjects = (paginationConfig: HarvestPaginationReqParams = {}) =>
		this.httpService
			.get<HarvestProjectResponse>(
				`${this.baseUrl}/projects`,
				this.getConfig({
					axiosConfig: { params: { is_active: true } },
					paginationConfig,
				}),
			)
			.pipe(treatAxiosResponse());

	public readonly getAllProjects = (params?: FetchAllPaginationParams) =>
		fetchAllFromHarvestPaginatedResponse(this.getProjects, 'projects', params);

	public readonly getAllProjectsStream = () => this.getAllProjects().pipe(mergeAll());

	public readonly getTimeEntries = (
		params: { project_id: number; from: string },
		paginationConfig: FetchAllPaginationParams = {},
	) =>
		this.httpService
			.get<HarvestTimeSheetsResponse>(
				`${this.baseUrl}/time_entries`,
				this.getConfig({
					axiosConfig: { params: { ...params, is_running: false } },
					paginationConfig,
				}),
			)
			.pipe(treatAxiosResponse());

	public readonly getAllTimeEntries = (
		params: { project_id: number; from: string },
		paginationConfig: FetchAllPaginationParams = {},
	) =>
		fetchAllFromHarvestPaginatedResponse(
			(config) => this.getTimeEntries(params, config),
			'time_entries',
			paginationConfig,
		);
}
