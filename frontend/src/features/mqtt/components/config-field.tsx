import { PasswordInput, Select, Switch, TextInput } from "@mantine/core";
import type { FunctionComponent } from "react";
import type {
	ConfigFieldOption,
	ConfigFieldSpec,
} from "@/features/mqtt/helpers/field-spec";

// A value the firmware does not accept can still sit in the config file —
// set_configs never validates values — so surface it as an option instead of
// rendering a select that looks unset. An empty value has nothing to surface.
const optionsWith = (
	options: ConfigFieldOption[],
	value: string,
): ConfigFieldOption[] =>
	value === "" || options.some((option) => option.value === value)
		? options
		: [...options, { value, label: `${value} (unsupported)` }];

type Props = {
	spec: ConfigFieldSpec;
	value: string;
	error?: string;
	onChange: (value: string) => void;
	onBlur: () => void;
};

// Every config value travels as a string, so the field speaks strings in both
// directions and the spec decides how it is rendered.
export const ConfigField: FunctionComponent<Props> = ({
	spec,
	value,
	error,
	onChange,
	onBlur,
}) => {
	switch (spec.kind) {
		case "switch":
			return (
				<Switch
					label={spec.label}
					description={spec.description}
					checked={value === "yes"}
					onChange={(event) =>
						onChange(event.currentTarget.checked ? "yes" : "no")
					}
					onBlur={onBlur}
					error={error}
				/>
			);
		case "select":
			return (
				<Select
					label={spec.label}
					description={spec.description}
					data={optionsWith(spec.options, value)}
					value={value}
					onChange={(next) => onChange(next ?? "")}
					onBlur={onBlur}
					error={error}
					allowDeselect={false}
				/>
			);
		case "password":
			return (
				<PasswordInput
					label={spec.label}
					description={spec.description}
					placeholder={spec.placeholder}
					value={value}
					onChange={(event) => onChange(event.currentTarget.value)}
					onBlur={onBlur}
					error={error}
				/>
			);
		case "text":
			return (
				<TextInput
					label={spec.label}
					description={spec.description}
					placeholder={spec.placeholder}
					value={value}
					onChange={(event) => onChange(event.currentTarget.value)}
					onBlur={onBlur}
					error={error}
				/>
			);
	}
};
