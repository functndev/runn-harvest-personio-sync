export type PersonioResponse<T> = {
	success: boolean;
	data: T;
};

export type PersonioAuthResponse = PersonioResponse<{ token: string }>;

export type PersonioTimeOffData = {
	id: number;
	status: 'approved' | 'requested';
	comment: string;
	start_date: string;
	end_date: string | null;
	days_count: number;
	half_day_start: number;
	half_day_end: number;
	time_off_type: {
		type: string;
		attributes: {
			id: number;
			name: string;
			category: string;
		};
	};
	employee: {
		type: string;
		attributes: {
			id: LabelValuePair<number>;
			first_name: LabelValuePair;
			last_name: LabelValuePair;
			email: LabelValuePair;
		};
	};
	created_by: string;
	certificate: {
		status: string;
	};
	created_at: string;
	updated_at: string;
};

export type PersonioTimeOffsResponse = PersonioResponse<
	{
		type: string;
		attributes: PersonioTimeOffData;
	}[]
>;

export type LabelValuePair<T = string> = {
	label: string;
	value: T;
};

export type PersonioPersonData = {
	id: LabelValuePair<number>;
	first_name: LabelValuePair;
	last_name: LabelValuePair;
	email: LabelValuePair;
	status: LabelValuePair;
	created_at: LabelValuePair;
};

export type PersonioPeopleResponse = PersonioResponse<
	{
		type: string;
		attributes: PersonioPersonData;
	}[]
>;
