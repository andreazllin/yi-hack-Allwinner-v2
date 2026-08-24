import { useQuery } from "@tanstack/react-query";
import type { GetConfigsResponse } from "@/api";
import { getConfigsOptions } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk, stripNullKey } from "@/lib/cgi";

// Module scope, not an inline closure: TanStack Query only reuses a memoised
// select result while the select function keeps its identity. A fresh closure
// per render would hand back a new object every render, and the form's
// hydration effect would then re-run and overwrite whatever was being typed.
const selectSystemConfig = (data: GetConfigsResponse) =>
	stripNullKey(assertCgiOk(data));

// The page edits five keys but keeps the whole record: set_configs writes only
// the keys in the body, and the save posts the full merged object back, so
// every untouched key has to survive the round trip.
export function useSystemConfig() {
	return useQuery({
		...getConfigsOptions({ query: { conf: "system" } }),
		select: selectSystemConfig,
	});
}
