import { useQuery } from "@tanstack/react-query";
import type { GetConfigsResponse } from "@/api";
import { getConfigsOptions } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk, stripNullKey } from "@/lib/cgi";

const selectSystemConfig = (data: GetConfigsResponse): Record<string, string> =>
	stripNullKey(assertCgiOk(data));

// The recording settings live in system.conf, next to unrelated keys the Events
// page does not touch. `enabled` is passed in because the settings card is
// collapsed by default and every /cgi-bin GET forks a shell on the camera —
// the conf is only read once the reader opens the card.
export function useSystemConfig(enabled: boolean) {
	return useQuery({
		...getConfigsOptions({ query: { conf: "system" } }),
		enabled,
		select: selectSystemConfig,
	});
}
