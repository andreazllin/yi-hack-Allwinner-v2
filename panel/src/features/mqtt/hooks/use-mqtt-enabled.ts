import { useQuery } from "@tanstack/react-query";
import type { GetConfigsResponse, YesNo } from "@/api";
import { getConfigsOptions } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk } from "@/lib/cgi";

// The stock mqtt page reads the whole system config but uses one key from it:
// MQTT, the master switch of the MQTT client.
const selectMqttFlag = (data: GetConfigsResponse): YesNo =>
	assertCgiOk(data).MQTT === "yes" ? "yes" : "no";

export function useMqttEnabled() {
	return useQuery({
		...getConfigsOptions({ query: { conf: "system" } }),
		select: selectMqttFlag,
	});
}
