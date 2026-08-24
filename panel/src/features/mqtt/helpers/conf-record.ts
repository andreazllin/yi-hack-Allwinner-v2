import type { GetConfigsResponse, YesNo } from "@/api";

// get_configs answers with an open string map, so every read has to project
// the keys the page edits. Object.fromEntries drops the literal key union,
// hence the assertions here — the key lists stay the single source of truth.
export function pickStrings<K extends string>(
	record: GetConfigsResponse,
	keys: readonly K[],
): Record<K, string> {
	return Object.fromEntries(
		keys.map((key) => [key, record[key] ?? ""]),
	) as Record<K, string>;
}

// The firmware scripts test yes/no keys with `== "yes"`, so a missing key, an
// empty value or a typo all behave as "no" — mirror that instead of showing a
// third state the camera does not have.
export function pickYesNo<K extends string>(
	record: GetConfigsResponse,
	keys: readonly K[],
): Record<K, YesNo> {
	return Object.fromEntries(
		keys.map((key) => [key, record[key] === "yes" ? "yes" : "no"]),
	) as Record<K, YesNo>;
}
