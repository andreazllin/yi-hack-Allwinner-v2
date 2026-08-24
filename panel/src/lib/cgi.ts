import { MalformedResponseError } from "@/lib/api-client";

// Every CGI failure is HTTP 200 with {"error":"true"} — transport-level
// success says nothing. Run response bodies through this before trusting
// them, so logical failures surface as thrown errors (and land in
// TanStack Query's error state instead of the success path).
export function assertCgiOk<T extends { error?: unknown }>(data: T): T {
	if (data.error === "true") {
		throw new Error("The camera rejected the request");
	}
	return data;
}

// get_configs.sh appends a fake "NULL":"NULL" key to every response to
// avoid a trailing comma in its shell printf. Strip it before use.
export function stripNullKey<T extends Record<string, unknown>>(
	conf: T,
): Omit<T, "NULL"> {
	const { NULL: _ignored, ...rest } = conf;
	return rest;
}

// Distinguishing a malformed reply from an unreachable camera matters: the
// fixes are different (a quote in an SSID or hostname vs. a network problem),
// and a wrong hint sends the reader looking in the wrong place.
export function describeQueryError(
	error: unknown,
	surface: string,
): { title: string; description: string } {
	if (error instanceof MalformedResponseError) {
		return {
			title: `The camera's ${surface} response was malformed`,
			description:
				"The firmware prints JSON without escaping values, so a quote in an " +
				"SSID or hostname breaks the document. Renaming the network or the " +
				"camera fixes it.",
		};
	}
	return {
		title: `Could not load ${surface}`,
		description:
			"The camera did not answer. Check that it is reachable (and CAM_HOST in dev).",
	};
}

// set_configs.sh reconstructs each entry as `KEY=VALUE` with jq and then reads
// the value back with `cut -d'=' -f2`, which keeps only the text before the
// SECOND `=`. A value containing `=` is therefore silently truncated and the
// script still answers {"error":"false"} — a password ending in `=` would be
// saved wrong and lock the user out of whatever it authenticates. There is no
// server-side signal, so refuse the save here instead.
export function assertSavableConf(body: unknown): void {
	if (typeof body !== "object" || body === null) {
		return;
	}
	const offenders = Object.entries(body as Record<string, unknown>)
		.filter(([, value]) => typeof value === "string" && value.includes("="))
		.map(([key]) => key);
	if (offenders.length > 0) {
		throw new Error(
			`The camera cannot store an "=" in a value, and would save a truncated ` +
				`version without reporting an error. Remove it from: ${offenders.join(", ")}.`,
		);
	}
}
