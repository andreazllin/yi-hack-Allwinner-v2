import { useQuery } from "@tanstack/react-query";
import { firmwareUpgradeOptions } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk } from "@/lib/cgi";

// fw_upgrade.sh?get=info runs a LIVE wget to the GitHub API on the camera —
// slow and network-dependent, so it is not re-fetched on every remount.
const FW_INFO_STALE_MS = 5 * 60_000;

// get=info only reads (get=upgrade is the destructive mode), so the generated
// queryOptions factory is safe to hand to useQuery here.
export function useFirmwareInfo() {
	return useQuery({
		...firmwareUpgradeOptions({ query: { get: "info" } }),
		staleTime: FW_INFO_STALE_MS,
		select: (data) => assertCgiOk(data),
	});
}
