import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { wifi } from "@/api";
import { assertCgiOk } from "@/lib/cgi";

// The spec models wifi.sh as one POST because action=save needs a body; the
// firmware serves action=scan as a GET and that branch never reads stdin, so a
// bodyless POST reaches the same code. wifiMutation() is not spread here: its
// variables are the raw transport Options and its data the scan|save union,
// while this hook pins the action and takes no variables.
export function useScanWifi() {
	return useMutation({
		mutationFn: async () => {
			const response = await wifi({
				query: { action: "scan" },
				throwOnError: true,
			});
			// A rejected query string answers with the {"error":"true"} shape
			// instead of {"wifi":[...]}; only that shape has anything to check.
			const body = response.data;
			return "wifi" in body ? body : assertCgiOk(body);
		},
		onError: (error) => {
			notifications.show({
				title: "WiFi scan failed",
				message: `The camera could not list nearby networks: ${error.message}`,
				color: "red",
			});
		},
	});
}
