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

// eventsfile.sh only lists recordings whose name is exactly 12 or 14 chars and
// ends in .mp4, with 'M' and 'S' markers at fixed offsets — the same offsets
// eventsfiledel.sh's validateRecFile checks against the combined
// "<dirname>/<filename>" string (27 or 29 chars total).
const EVENT_FILE_PATTERN = /^\d{2}(?:\d{2})?M\d{2}S\d{2}\.mp4$/;

// Guards the value interpolated into eventsfiledel.sh's `rm -f` as root. The
// delete call sends the "<dir>/<file>" separator unescaped (see
// use-delete-event-file.ts for why), which disables the query serializer's
// escaping for that value — so this is the only thing standing between a
// filename and the shell.
export function isEventFileName(value: string): boolean {
	return EVENT_FILE_PATTERN.test(value);
}
