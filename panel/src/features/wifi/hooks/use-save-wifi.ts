import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { type WifiSaveRequest, wifi } from "@/api";
import { assertCgiOk } from "@/lib/cgi";

// Nothing to invalidate afterwards: the credentials go to a flash partition
// that only the next boot reads, so status.json keeps reporting the network the
// camera is associated with right now.
export function useSaveWifi() {
	return useMutation({
		mutationFn: async (credentials: WifiSaveRequest) => {
			const response = await wifi({
				query: { action: "save" },
				body: credentials,
				throwOnError: true,
			});
			// action=save answers with the {"error":...} shape; the union also
			// carries the scan shape, which has nothing to check.
			const body = response.data;
			return "wifi" in body ? body : assertCgiOk(body);
		},
		onSuccess: () => {
			notifications.show({
				title: "WiFi credentials saved",
				message: "The camera joins this network at its next reboot.",
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not save the WiFi credentials",
				message: `The camera refused the write: ${error.message}`,
				color: "red",
			});
		},
	});
}
