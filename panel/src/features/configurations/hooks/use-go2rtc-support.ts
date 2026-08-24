import { useQuery } from "@tanstack/react-query";
import type { StatusInfo } from "@/api";
import { getStatusOptions } from "@/api/@tanstack/react-query.gen";

// status.json reports whether the go2rtc binary is on this firmware; the
// stock page removes the go2rtc option from the RTSP server select only when
// it answers exactly "no". One fetch per page load, no polling — this page
// does not need telemetry, just that one flag.
const selectGo2rtcSupport = (data: StatusInfo): boolean => data.go2rtc !== "no";

export function useGo2rtcSupport() {
	return useQuery({
		...getStatusOptions(),
		select: selectGo2rtcSupport,
	});
}
