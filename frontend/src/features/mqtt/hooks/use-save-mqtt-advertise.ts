import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getConfigsQueryKey } from "@/api/@tanstack/react-query.gen";
import { writeConf } from "@/features/mqtt/helpers/write-conf";

export function useSaveMqttAdvertise() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: Record<string, string>) =>
			writeConf("mqtt_advertise", body),
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: getConfigsQueryKey({ query: { conf: "mqtt_advertise" } }),
			});
		},
		onSuccess: () => {
			notifications.show({
				title: "MQTT advertise configuration saved",
				message: "The camera applies the new settings after a reboot.",
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not save the MQTT advertise configuration",
				message: `${error.message}. The camera writes the keys one by one and stops at the first it rejects, so reload the page to see what it kept.`,
				color: "red",
			});
		},
	});
}
