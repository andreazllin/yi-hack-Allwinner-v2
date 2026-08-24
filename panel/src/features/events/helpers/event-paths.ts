// eventsdir.sh only emits directories whose name is exactly 14 chars long in
// the form YYYY"Y"MM"M"DD"D"HH"H", e.g. "2024Y08M24D15H" (one per hour).
const EVENT_DIR_PATTERN = /^\d{4}Y\d{2}M\d{2}D\d{2}H$/;

// This is the ONLY validation an event directory name ever gets: the firmware's
// own validateRecDir is dead code (`DIR = "none"` with spaces is a command, not
// an assignment), the shared query-string blocklist still allows `/`, `.` and
// space, and eventsdirdel.sh interpolates the value UNQUOTED into
// `rm -rf /tmp/sd/record/$DIR` as root — `dir=all` even expands to `*` and
// wipes every recording. Refuse anything the camera could not have produced.
export function isEventDirName(value: string): boolean {
	return EVENT_DIR_PATTERN.test(value);
}

// Recordings and their thumbnails are static files under /record/<dirname>/,
// served by the camera's BusyBox httpd (proxied to CAM_HOST in dev). They are
// loaded by the browser with <img>/<video>/<a download>, never through the
// generated SDK, which hardcodes responseType "json" for binary responses.
export function buildRecordUrl(dir: string, filename: string): string {
	return `/record/${dir}/${filename}`;
}
