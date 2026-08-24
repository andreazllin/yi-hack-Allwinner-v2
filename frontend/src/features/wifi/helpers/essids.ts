import type { WifiResponse } from "@/api";

// action=scan always closes its array with an empty-string element so the shell
// printf never emits a dangling comma, and iwlist can add further blanks.
// Neither is a network.
export function essidsFromScan(response: WifiResponse | undefined): string[] {
	if (!response || !("wifi" in response)) {
		return [];
	}
	return response.wifi.filter((essid) => essid.trim() !== "");
}
