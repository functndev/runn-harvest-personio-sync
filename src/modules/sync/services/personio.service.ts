import type {
	PersonioAuthResponse,
	PersonioPeopleResponse,
	PersonioTimeOffsResponse,
} from '../types/personio.types';
import type { AxiosRequestConfig } from 'axios';
import type { CheckedTimeOffsParameters } from '../types/personio-runn.types';

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { mergeMap, pluck, tap } from 'rxjs/operators';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { getFormattedDate } from '../../../util/date-format';
import { SafeConfigService } from './safe-config.service';
import { timeoutRetryStrategy } from '../../../util/request';
import { treatPersonioResponse } from '../util/personio-util';

@Injectable()
export class PersonioService {
	private readonly personioBaseUrl: string;
	private readonly personioClientId: string;
	private readonly personioSecret: string;

	constructor(
		private readonly httpService: HttpService,
		private readonly safeConfigService: SafeConfigService,
		@InjectPinoLogger(PersonioService.name)
		private readonly pinoLogger: PinoLogger,
	) {
		this.personioBaseUrl = safeConfigService.getStringOrError('PERSONIO_BASE_URL');
		this.personioClientId = safeConfigService.getStringOrError('PERSONIO_CLIENT_ID');
		this.personioSecret = safeConfigService.getStringOrError('PERSONIO_CLIENT_SECRET');
	}

	private readonly getConfig = (
		token: string,
		{ headers, ...rest }: AxiosRequestConfig = {},
	): AxiosRequestConfig => ({
		headers: { Authorization: `Bearer ${token}`, ...headers },
		...rest,
	});

	private readonly authenticate = () => {
		return this.httpService
			.post<PersonioAuthResponse>(
				`${this.personioBaseUrl}/auth`,
				{},
				{
					params: {
						client_id: this.personioClientId,
						client_secret: this.personioSecret,
					},
				},
			)
			.pipe(
				timeoutRetryStrategy(),
				pluck('data'),
				tap(() => this.pinoLogger.debug('authenticated with personio api')),
			);
	};

	private readonly getHttpTimeOffs =
		(params: CheckedTimeOffsParameters) =>
		({ data: { token } }: PersonioAuthResponse) =>
			this.httpService
				.get<PersonioTimeOffsResponse>(
					`${this.personioBaseUrl}/company/time-offs`,
					this.getConfig(token, {
						params: {
							start_date:
								'daySpan' in params
									? getFormattedDate('past', params.daySpan)
									: params.start,
							end_date:
								'daySpan' in params
									? getFormattedDate('future', params.daySpan)
									: params.end,
						},
					}),
				)
				.pipe(
					treatPersonioResponse(),
					tap(() => this.pinoLogger.debug('loaded personio time-offs')),
				);

	private readonly getHttpPersonioPeople = ({ data: { token } }: PersonioAuthResponse) =>
		this.httpService
			.get<PersonioPeopleResponse>(
				`${this.personioBaseUrl}/company/employees`,
				this.getConfig(token),
			)
			.pipe(
				treatPersonioResponse(),
				tap(() => this.pinoLogger.debug('loaded personio people')),
			);

	public readonly getPeople = () =>
		this.authenticate().pipe(mergeMap(this.getHttpPersonioPeople));

	public readonly getTimeOffs = (params: CheckedTimeOffsParameters) =>
		this.authenticate().pipe(mergeMap(this.getHttpTimeOffs(params)));
}
