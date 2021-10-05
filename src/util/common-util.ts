import { pipe } from 'ramda';

export const immutableReverse = <T>(array: T[]) => [...array].reverse();

export const entriesOf = <T>(data: { [key: string]: T }) => Object.entries(data);

export const valuesOf = <T>(data: { [key: string]: T }) => Object.values(data);

export const reversedEntriesOf = pipe(entriesOf, immutableReverse);
