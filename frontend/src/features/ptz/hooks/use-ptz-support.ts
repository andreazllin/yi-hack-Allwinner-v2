import { useQuery } from "@tanstack/react-query";
import { getStatusOptions } from "@/api/@tanstack/react-query.gen";

// status.json is the feature detect for PTZ: the camera computes `ptz` from
// the same model-suffix allowlist the stock UI hardcodes. Read once, no
// polling — this page has no reason to re-fork the shell for it.
export function usePtzSupport() {
	return useQuery(getStatusOptions());
}
