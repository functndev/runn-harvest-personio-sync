import type { IndexType } from './common.types';

export type Maybe<T> = T | undefined;
export type Nullable<T> = T | null;

export type StringPropsOfType<T> = {
	[K in keyof T]: T[K] extends IndexType ? K : never;
}[keyof T];

export type ArrayPropsOfType<T> = {
	[K in keyof T]: T[K] extends Array<unknown> ? K : never;
}[keyof T];
