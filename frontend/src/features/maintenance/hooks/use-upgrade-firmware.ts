import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { firmwareUpgrade } from "@/api";
import { assertCgiOk } from "@/lib/cgi";

// fw_upgrade.sh?get=upgrade is a DESTRUCTIVE mutating GET (it rm -rf's four
// /tmp/sd paths, then downloads, flashes and reboots), so the generator only
// emits a queryOptions factory for it — wrap the SDK function by hand.
export function useUpgradeFirmware() {
	return useMutation({
		mutationFn: async () => {
			const response = await firmwareUpgrade({
				query: { get: "upgrade" },
				throwOnError: true,
			});
			// The upgrade path answers text/html, but OpenAPI 3.0 cannot vary a 200
			// schema by query value, so the generated type claims FwInfoResponse and
			// the SDK asks axios for JSON: the status text arrives unparsed. The JSON
			// shape only appears for a rejected query string, i.e. {"error":"true"}.
			const body: unknown = assertCgiOk(response.data);
			return typeof body === "string" ? body.trim() : "";
		},
		onSuccess: (message) => {
			notifications.show({
				title: "Upgrade requested",
				message: message || "The camera accepted the upgrade request.",
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not start the firmware upgrade",
				message: `fw_upgrade.sh?get=upgrade failed: ${error.message}`,
				color: "red",
			});
		},
	});
}
