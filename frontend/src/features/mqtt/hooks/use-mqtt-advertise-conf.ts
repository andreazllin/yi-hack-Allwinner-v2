import { useQuery } from "@tanstack/react-query";
import type { GetConfigsResponse } from "@/api";
import { getConfigsOptions } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk, stripNullKey } from "@/lib/cgi";

// Declared outside the hook so the select result keeps its identity between
// renders — the page hydrates the form from it in an effect.
const selectConf = (data: GetConfigsResponse) =>
	stripNullKey(assertCgiOk(data));

export function useMqttAdvertiseConf() {
	return useQuery({
		...getConfigsOptions({ query: { conf: "mqtt_advertise" } }),
		select: selectConf,
	});
}
