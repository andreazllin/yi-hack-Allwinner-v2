import { useQuery } from "@tanstack/react-query";
import type { GetConfigsResponse } from "@/api";
import { getConfigsOptions } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk, stripNullKey } from "@/lib/cgi";

// The whole system.conf as returned by the camera, minus the fake NULL key.
// Both configuration pages edit a subset of these keys and post the record
// back merged, so keys neither page knows about survive a round-trip.
export type SystemConfigRecord = Record<string, string>;

// Declared once at module scope so the query keeps a stable select function:
// a new closure per render makes TanStack re-run it and re-run the structural
// comparison the hydration effect relies on.
const selectSystemConfig = (data: GetConfigsResponse): SystemConfigRecord =>
	stripNullKey(assertCgiOk(data));

export function useSystemConfig() {
	return useQuery({
		...getConfigsOptions({ query: { conf: "system" } }),
		select: selectSystemConfig,
	});
}
