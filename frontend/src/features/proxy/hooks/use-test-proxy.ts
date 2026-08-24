import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { testProxy } from "@/api";
import { assertCgiOk } from "@/lib/cgi";

// "1" routes through proxychains4, anything else runs a direct wget.
export type ProxyTestMode = "0" | "1";

// proxy.sh is a GET, so the generator only emits a queryOptions factory for it
// — which must never reach useQuery: the script makes the camera wget an
// external service (ipinfo.io), and a query would fire that on page load.
export function useTestProxy(mode: ProxyTestMode) {
	const label = mode === "1" ? "through the proxy" : "without the proxy";
	return useMutation({
		mutationFn: async () => {
			const response = await testProxy({
				query: { proxy: mode },
				throwOnError: true,
			});
			return assertCgiOk(response.data);
		},
		onSuccess: () => {
			notifications.show({
				title: `Test ${label} completed`,
				message: "The camera reached ipinfo.io and returned its answer.",
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: `Test ${label} failed`,
				// A failed wget leaves the result field empty, which makes the
				// script's own JSON malformed and fails the response parse.
				message: `No usable answer from the camera: ${error.message}`,
				color: "red",
			});
		},
	});
}
