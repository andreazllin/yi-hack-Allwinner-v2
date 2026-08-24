export type ConfigFieldOption = {
	value: string;
	label: string;
};

// One control of a config form. `name` is generic so each page can pin it to
// the keys of its own form values and let the compiler reject a typo.
export type ConfigFieldSpec<TName extends string = string> =
	| {
			kind: "text" | "password";
			name: TName;
			label: string;
			description?: string;
			placeholder?: string;
	  }
	| {
			kind: "switch";
			name: TName;
			label: string;
			description?: string;
	  }
	| {
			kind: "select";
			name: TName;
			label: string;
			description?: string;
			options: ConfigFieldOption[];
	  };

export type ConfigSectionSpec<TName extends string = string> = {
	title: string;
	description?: string;
	fields: ConfigFieldSpec<TName>[];
};
