import { TIMEZONES } from "@/features/configurations/constants/timezones";

// The camera stores a POSIX timezone string and nothing else, and the stock
// table maps 396 locations onto 161 distinct strings — 32 of them share
// CET-1CEST,M3.5.0,M10.5.0/3 alone. So the dropdown offers one option per
// string: what is saved is what is shown back, with no guess about which city
// was meant. The locations are kept as search terms and as the subtitle under
// each option, which is what makes the list usable at all.
const LOCATIONS_BY_TZ = new Map<string, string[]>();
for (const { location, tz } of TIMEZONES) {
	const locations = LOCATIONS_BY_TZ.get(tz);
	if (locations) {
		locations.push(location);
	} else {
		LOCATIONS_BY_TZ.set(tz, [location]);
	}
}

// Table order, so the strings arrive grouped by region rather than sorted by a
// syntax nobody reads alphabetically.
export const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
	...LOCATIONS_BY_TZ.keys(),
].map((tz) => ({ value: tz, label: tz }));

export const isKnownTimezone = (tz: string): boolean => LOCATIONS_BY_TZ.has(tz);

export const timezoneLocations = (tz: string): string[] =>
	LOCATIONS_BY_TZ.get(tz) ?? [];

// IANA writes Europe/Rome as America/New_York; the stock table writes
// "America/New York". Fold underscores so a search copied from anywhere else
// still matches.
const normalize = (value: string): string =>
	value.toLowerCase().replaceAll("_", " ");

// Locations that match the search, for the option subtitle: the row a search
// surfaced has to show WHY it matched, or the list asks to be trusted blindly.
export const matchingLocations = (tz: string, search: string): string[] => {
	const query = normalize(search.trim());
	const locations = timezoneLocations(tz);
	if (query === "") {
		return locations;
	}
	return locations.filter((location) => normalize(location).includes(query));
};

// A string matches on itself or on any location it covers, so "rome" finds
// CET-1CEST,M3.5.0,M10.5.0/3 even though the label never says Rome.
export const timezoneMatches = (tz: string, search: string): boolean => {
	const query = normalize(search.trim());
	return (
		query === "" ||
		normalize(tz).includes(query) ||
		matchingLocations(tz, search).length > 0
	);
};
