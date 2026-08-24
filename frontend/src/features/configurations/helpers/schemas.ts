import { z } from "zod";

// set_configs.sh writes these values verbatim with sed and validates none of
// them, so anything rejected client-side here would otherwise land in
// system.conf and break the service at the next boot.
const tcpPort = z
	.string()
	.regex(/^\d{1,5}$/, "Digits only — the firmware writes this value verbatim")
	.refine((value) => {
		const port = Number(value);
		return port >= 1 && port <= 65535;
	}, "Must be between 1 and 65535");

const TIMELAPSE_MINUTES = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"10",
	"15",
	"20",
	"30",
	"60",
	"120",
	"180",
	"240",
	"360",
	"1440",
];

// TIMELAPSE_DT is the one value set_configs.sh does check: anything outside
// its whitelist (or the "1440+<offset>" form, offset <= 1440) is dropped
// while the response still says error=false. Empty stays allowed so a conf
// that never had the key does not block saving the rest of the page.
const timelapseInterval = z.string().refine((value) => {
	if (value === "" || TIMELAPSE_MINUTES.includes(value)) {
		return true;
	}
	const dailyOffset = /^1440\+(\d{1,4})$/.exec(value);
	return dailyOffset !== null && Number(dailyOffset[1]) <= 1440;
}, "Use 1-6, 10, 15, 20, 30, 60, 120, 180, 240, 360, 1440 or 1440+<offset>");

// Only the keys the firmware itself constrains are validated; the rest of the
// page is free text the camera accepts as-is (and the selects cannot produce
// an out-of-domain value). Form keys not listed here are ignored by z.object,
// which is why this can validate the whole values record.
export const configurationsSchema = z.object({
	RTSP_PORT: tcpPort,
	HTTPD_PORT: tcpPort,
	TIMELAPSE_DT: timelapseInterval,
});
