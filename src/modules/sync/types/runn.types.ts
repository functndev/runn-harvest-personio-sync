import type { Nullable } from '../../../types/helper.types';

export type RunnRole = {
	id: string;
	name: string;
	archived: boolean;
};

export type RunnPerson = {
	id: string;
	name: string;
	archived: false;
	references: unknown;
	first_name: string;
	last_name: string;
	email: string;
	role_id: string;
	role: RunnRole;
	team_id: string;
	team: {
		id: string;
		name: string;
	};
	current_contract_id: string;
	current_contract: {
		id: string;
		start_date: string | null;
		end_date: string | null;
		minutes_per_day: number;
		employment_type: string;
		rostered_days: number[];
		cost_per_hour: string;
		role_id: string;
		role: RunnRole;
	};
	projects: {
		id: string;
		name: string;
	}[];
	tags: string[];
	is_placeholder: boolean;
};

export type RunnTimeOff = {
	id: string;
	start_date: string;
	end_date: string;
	person_id: string;
	note: string | null;
	type: string;
};

export type RunnProject = {
	id: string;
	name: string;
	archived: boolean;
	references: unknown;
	confirmed: boolean;
	client_name: string;
	client_id: string;
	team_id: null;
	budget: string;
	pricing_model: string;
	rate_card_id: string;
	rate_type: string;
	tags: string[];
};

export type RunnActual = {
	date: string;
	person_id: string;
	project_id: string;
	role_id: string;
	billable_minutes: number;
	nonbillable_minutes: number;
	billable_note: Nullable<string>;
	nonbillable_note: Nullable<string>;
	phase_id: Nullable<string>;
	origin_data: unknown;
};

export type RunnCreateActualParams = {
	date: string;
	person_id: string;
	project_id: string;
	role_id: string;
	billable_minutes: number;
	nonbillable_minutes?: number;
	phase_id?: string;
	autofill?: boolean;
	billable_note?: string;
	nonbillable_note?: string;
};
