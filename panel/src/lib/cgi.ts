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
