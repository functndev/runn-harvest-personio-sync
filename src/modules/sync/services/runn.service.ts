import type { AxiosRequestConfig } from 'axios';
import type {
	RunnPerson,
	RunnProject,
	RunnTimeOff,
	RunnCreateActualParams,
	RunnActual,
} from '../types/runn.types';

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, mergeAll, pluck, tap } from 'rxjs/operators';
import { catchError, of, throwError } from 'rxjs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { SafeConfigService } from './safe-config.service';
import { treatAxiosResponse } from '../util/axios-util';

@Injectable()
export class RunnService {
	private readonly runnBaseUrl: string;
	private readonly runnToken: string;

	constructor(
		private readonly httpService: HttpService,
		private readonly safeConfigService: SafeConfigService,
		@InjectPinoLogger(RunnService.name)
		private readonly pinoLogger: PinoLogger,
	) {
		this.runnBaseUrl = safeConfigService.getStringOrError('RUNN_BASE_URL');
		this.runnToken = safeConfigService.getStringOrError('RUNN_TOKEN');
	}

	private readonly getConfig = ({
		headers,
		...rest
	}: AxiosRequestConfig = {}): AxiosRequestConfig => ({
		headers: { Authorization: `Bearer ${this.runnToken}`, ...headers },
		...rest,
	});

	public readonly getPeople = () =>
		this.httpService
			.get<RunnPerson[]>(`${this.runnBaseUrl}/people`, this.getConfig())
			.pipe(
				treatAxiosResponse(),
				tap(() => this.pinoLogger.debug('loaded runn people')),
			);

	public readonly getPeopleStream = () => this.getPeople().pipe(mergeAll());

	public readonly getTimeOffs = () =>
		this.httpService
			.get<RunnTimeOff[]>(`${this.runnBaseUrl}/time_offs`, this.getConfig())
			.pipe(
				treatAxiosResponse(),
				tap(() => this.pinoLogger.debug('loaded runn time-offs')),
			);

	public readonly getProjects = () =>
		this.httpService
			.get<RunnProject[]>(`${this.runnBaseUrl}/projects`, this.getConfig())
			.pipe(
				treatAxiosResponse(),
				tap(() => this.pinoLogger.debug('loaded runn projects')),
			);

	public readonly deleteRunnTime = ({ id, ...rest }: RunnTimeOff) =>
		this.httpService
			.delete<{ message: string }>(
				`${this.runnBaseUrl}/time_offs/${id}`,
				this.getConfig(),
			)
			.pipe(
				treatAxiosResponse(),
				tap(() => this.pinoLogger.debug(`deleted runn time with id ${id}`)),
				map(({ message }) => ({
					message,
					data: { id, ...rest },
				})),
			);

	public readonly addRunnTimeOff = (body: {
		start_date: string;
		end_date: string;
		person_id: string;
	}) => {
		return this.httpService
			.post<RunnTimeOff>(
				`${this.runnBaseUrl}/time_offs`,
				{ ...body, note: '@@personio-runn-sync@@' },
				this.getConfig({
					headers: {
						'Content-Type': 'application/json',
					},
				}),
			)
			.pipe(
				pluck('data'),
				tap(() =>
					this.pinoLogger.debug(
						`Added runn time ${body.start_date}-${body.end_date} off for id ${body.person_id}`,
					),
				),
				catchError((err) => {
					this.pinoLogger.error(
						{
							data: err?.response?.data,
							message: err?.message,
							config: err?.config?.data,
						},
						`Got Error from API`,
					);

					return err?.response?.data?.error?.includes?.('exists')
						? of({
								message: err?.message as string | undefined,
								data: err?.config?.data as unknown | undefined,
								response: err?.response?.data as unknown | undefined,
						  })
						: throwError(err);
				}),
			);
	};

	public readonly createActual = (body: RunnCreateActualParams) =>
		this.httpService
			.post<RunnActual>(
				`${this.runnBaseUrl}/actuals`,
				body,
				this.getConfig({
					headers: {
						'Content-Type': 'application/json',
					},
				}),
			)
			.pipe(
				pluck('data'),
				tap((data) => this.pinoLogger.debug({ data, body }, 'Added runn actual')),
				catchError((err) => {
					this.pinoLogger.error(
						{
							data: err?.response?.data,
							message: err?.message,
							config: err?.config?.data,
						},
						`Got Error from API`,
					);

					return of({
						message: err?.message as string | undefined,
						data: err?.config?.data as unknown | undefined,
						response: err?.response?.data as unknown | undefined,
					});
				}),
			);
}
