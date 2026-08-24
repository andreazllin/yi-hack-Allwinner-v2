import { useQuery } from "@tanstack/react-query";
import type { GetConfigsResponse } from "@/api";
import { getConfigsOptions } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk, stripNullKey } from "@/lib/cgi";

// Module scope, not an inline closure: TanStack Query only reuses a memoised
// select result while the select function keeps its identity. A fresh closure
// per render would hand back a new object every render, and the form's
// hydration effect would then re-run and overwrite whatever was being typed.
const selectProxychainsConfig = (data: GetConfigsResponse) =>
	stripNullKey(assertCgiOk(data));

// The whole proxychains record, not just the field the form edits: the save
// posts the full merged object back and set_configs only writes what it is
// given.
export function useProxychainsConfig() {
	return useQuery({
		...getConfigsOptions({ query: { conf: "proxychains" } }),
		select: selectProxychainsConfig,
	});
}
