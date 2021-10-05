export type ParseOptionalPipeOptions = {
	optional?: boolean;
};

export type RegexPipeOptions = ParseOptionalPipeOptions & {
	regex: RegExp;
};
