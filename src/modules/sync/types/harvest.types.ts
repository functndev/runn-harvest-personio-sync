import type { Nullable } from '../../../types/helper.types';
import type { AxiosRequestConfig } from 'axios';

export type HarvestPaginationReqParams = {
	page?: number;
	per_page?: number;
};

export type FetchAllPaginationParams = {
	per_page?: number;
};

export type HarvestAxiosConfig = {
	axiosConfig?: AxiosRequestConfig;
	paginationConfig?: HarvestPaginationReqParams;
};

type HarvestPaginatedProps = {
	per_page: number;
	total_pages: number;
	total_entries: number;
	next_page: Nullable<number>;
	previous_page: Nullable<number>;
	page: number;
	links: {
		first: string;
		next: Nullable<string>;
		previous: Nullable<string>;
		last: string;
	};
};

export type HarvestPaginatedResponse<Data, Key extends string> = Record<Key, Data[]> &
	HarvestPaginatedProps;

export type HarvestPerson = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	telephone: string;
	timezone: string;
	weekly_capacity: number;
	has_access_to_all_future_projects: boolean;
	is_contractor: boolean;
	is_admin: boolean;
	is_project_manager: boolean;
	can_see_rates: boolean;
	can_create_projects: boolean;
	can_create_invoices: boolean;
	is_active: boolean;
	calendar_integration_enabled: boolean;
	calendar_integration_source: null;
	created_at: string;
	updated_at: string;
	default_hourly_rate: number;
	cost_rate: number;
	roles: string[];
	avatar_url: string;
};

export type HarvestPersonResponse = HarvestPaginatedResponse<HarvestPerson, 'users'>;

export type HarvestProject = {
	id: number;
	name: string;
	code: string;
	is_active: boolean;
	is_billable: boolean;
	is_fixed_fee: boolean;
	bill_by: string;
	budget: Nullable<number>;
	budget_by: string;
	budget_is_monthly: boolean;
	notify_when_over_budget: boolean;
	over_budget_notification_percentage: number;
	show_budget_to_all: boolean;
	created_at: string;
	updated_at: string;
	starts_on: Nullable<null>;
	ends_on: Nullable<null>;
	over_budget_notification_date: Nullable<string>;
	notes: string;
	cost_budget: number;
	cost_budget_include_expenses: boolean;
	hourly_rate: number;
	fee: number;
	client: {
		id: number;
		name: string;
		currency: string;
	};
};

export type HarvestProjectResponse = HarvestPaginatedResponse<HarvestProject, 'projects'>;

export type HarvestTimeSheet = {
	id: number;
	spent_date: string;
	hours: number;
	hours_without_timer: number;
	rounded_hours: number;
	notes: string;
	is_locked: boolean;
	locked_reason: Nullable<string>;
	is_closed: boolean;
	is_billed: boolean;
	timer_started_at: string;
	started_time: string;
	ended_time: Nullable<string>;
	is_running: boolean;
	billable: boolean;
	budgeted: boolean;
	billable_rate: Nullable<string>;
	cost_rate: number;
	created_at: string;
	updated_at: string;
	user: {
		id: number;
		name: string;
	};
	client: {
		id: number;
		name: string;
		currency: string;
	};
	project: {
		id: number;
		name: string;
		code: string;
	};
	task: {
		id: number;
		name: string;
	};
	user_assignment: {
		id: number;
		is_project_manager: boolean;
		is_active: boolean;
		use_default_rates: boolean;
		budget: Nullable<string>;
		created_at: string;
		updated_at: string;
		hourly_rate: number;
	};
	task_assignment: {
		id: number;
		billable: boolean;
		is_active: boolean;
		created_at: string;
		updated_at: string;
		hourly_rate: number;
		budget: Nullable<string>;
	};
	invoice: null;
	external_reference: null;
};

export type HarvestTimeSheetsResponse = HarvestPaginatedResponse<
	HarvestTimeSheet,
	'time_entries'
>;

export type HarvestTimesheetsProject = HarvestProject & {
	timeEntries: HarvestTimeSheet[];
};
