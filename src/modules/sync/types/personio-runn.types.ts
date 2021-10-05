import type { RunnTimeOff } from './runn.types';
import type { PersonioPersonData, PersonioTimeOffData } from './personio.types';

export type NewPerson = {
	runnId: string;
	personioId: number;
	email: string;
};

export type AccumulatedVal = {
	personioConnectionMap: Record<string, NewPerson>;
	runnTimeOffs: RunnTimeOff[];
	personioPeople: PersonioPersonData[];
	personioTimeOffs: PersonioTimeOffData[];
};

export type OverlappingInvervalProps = AccumulatedVal & {
	personioInterval: Interval;
	personioTimeOff: PersonioTimeOffData;
};

export type CheckedTimeOffsParameters =
	| {
			// userIds: Maybe<string[]>;
			start: string;
			end: string;
	  }
	| {
			// userIds: Maybe<string[]>;
			daySpan: number;
	  };
