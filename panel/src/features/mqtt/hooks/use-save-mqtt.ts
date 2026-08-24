import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { YesNo } from "@/api";
import { getConfigsQueryKey } from "@/api/@tanstack/react-query.gen";
import { writeConf } from "@/features/mqtt/helpers/write-conf";

type SaveMqttVariables = {
	// The full mqttv4.conf record with the edited keys applied.
	body: Record<string, string>;
	enabled: YesNo;
};

// Two writes, in the order the stock page issues them: mqttv4.conf first, then
// the master switch. Only the MQTT key goes to conf=system — set_configs
// treats HOSTNAME specially (it runs `hostname` and rewrites etc/hostname), so
// the rest of the system config must not be echoed back here.
export function useSaveMqtt() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ body, enabled }: SaveMqttVariables) => {
			await writeConf("mqtt", body);
			return writeConf("system", { MQTT: enabled });
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: getConfigsQueryKey({ query: { conf: "mqtt" } }),
			});
			queryClient.invalidateQueries({
				queryKey: getConfigsQueryKey({ query: { conf: "system" } }),
			});
		},
		onSuccess: () => {
			notifications.show({
				title: "MQTT configuration saved",
				message: "The camera applies the new settings after a reboot.",
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not save the MQTT configuration",
				message: `${error.message}. The save is two writes and the camera stores keys one by one, so reload the page to see what it kept.`,
				color: "red",
			});
		},
	});
}
