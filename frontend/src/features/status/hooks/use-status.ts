import { useQuery } from "@tanstack/react-query";
import { getStatusOptions } from "@/api/@tanstack/react-query.gen";

// status.json is read-only and cheap-ish, but it still forks a shell per
// hit — the 10s interval matches the stock UI's status page, no faster.
const STATUS_POLL_MS = 10_000;

export function useStatus() {
	return useQuery({
		...getStatusOptions(),
		refetchInterval: STATUS_POLL_MS,
	});
}
