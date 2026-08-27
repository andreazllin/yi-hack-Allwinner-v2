import { Select, Stack, Text } from "@mantine/core";
import {
	type FunctionComponent,
	type ReactNode,
	useMemo,
	useState,
} from "react";
import {
	isKnownTimezone,
	matchingLocations,
	TIMEZONE_OPTIONS,
	timezoneLocations,
	timezoneMatches,
} from "@/features/configurations/helpers/timezone";

// How many locations fit under one option before the rest become a count.
const SHOWN_LOCATIONS = 3;

type Props = {
	label: string;
	description?: ReactNode;
	value: string;
	error?: string;
	onBlur: () => void;
	onChange: (value: string) => void;
};

export const TimezoneSelect: FunctionComponent<Props> = ({
	label,
	description,
	value,
	error,
	onBlur,
	onChange,
}) => {
	// Controlled so the option rows can show which locations the search matched.
	const [search, setSearch] = useState("");

	// A string the table does not know — hand-written, or from a newer tzdata —
	// is offered as its own option rather than dropped: a field that reads as
	// empty while the camera holds a value invites overwriting it by accident.
	const options = useMemo(
		() =>
			value === "" || isKnownTimezone(value)
				? TIMEZONE_OPTIONS
				: [{ value, label: value }, ...TIMEZONE_OPTIONS],
		[value],
	);

	return (
		<Select
			label={label}
			description={description}
			// The camera ships with TIMEZONE empty, which is a real state and not a
			// loading one, so it gets a word rather than a blank box.
			placeholder="Not set"
			value={value === "" ? null : value}
			error={error}
			onBlur={onBlur}
			data={options}
			allowDeselect={false}
			searchable
			searchValue={search}
			onSearchChange={setSearch}
			nothingFoundMessage="No timezone or location matches"
			comboboxProps={{ shadow: "md" }}
			// Groups never occur here; the guard is what narrows the union.
			filter={({ options: parsed, search: query }) =>
				parsed.filter(
					(option) => "value" in option && timezoneMatches(option.value, query),
				)
			}
			renderOption={({ option }) => {
				const matched = matchingLocations(option.value, search);
				const total = timezoneLocations(option.value).length;
				const hidden = total - Math.min(matched.length, SHOWN_LOCATIONS);

				return (
					<Stack gap={0}>
						<Text size="sm" ff="monospace">
							{option.value}
						</Text>
						<Text size="xs" c="dimmed">
							{matched.slice(0, SHOWN_LOCATIONS).join(", ")}
							{hidden > 0 ? `, +${hidden} more` : ""}
						</Text>
					</Stack>
				);
			}}
			onChange={(selected) => {
				if (selected !== null) {
					onChange(selected);
				}
			}}
		/>
	);
};
