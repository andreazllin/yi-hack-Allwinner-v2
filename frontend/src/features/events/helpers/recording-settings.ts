import { z } from "zod";
import { zYesNo } from "@/api/zod.gen";

// Exactly the system.conf keys the stock eventsdir page owns. Every other key
// in the file is round-tripped untouched on save.
export const recordingSettingsSchema = z.object({
	// clean_records.sh exits without doing anything unless its argument is a
	// whole number in 1..99, and system.sh only installs the cron entry when the
	// value is not "0". set_configs.sh validates neither, so the check lives here.
	FREE_SPACE: z
		.string()
		.regex(/^\d{1,2}$/, "Whole number from 0 to 99 — 0 disables auto-clean"),
	EVENTS_TIME: z.enum(["autodetect", "local", "gmt"]),
	FTP_UPLOAD: zYesNo,
	FTP_FILE_DELETE_AFTER_UPLOAD: zYesNo,
	FTP_DIR_TREE: zYesNo,
	FTP_HOST: z.string(),
	FTP_DIR: z.string(),
	FTP_USERNAME: z.string(),
	FTP_PASSWORD: z.string(),
});

export type RecordingSettings = z.infer<typeof recordingSettingsSchema>;

export type EventsTime = RecordingSettings["EVENTS_TIME"];
type YesNo = RecordingSettings["FTP_UPLOAD"];

export const EVENTS_TIME_OPTIONS: { value: EventsTime; label: string }[] = [
	{ value: "autodetect", label: "Autodetect" },
	{ value: "local", label: "Local time" },
	{ value: "gmt", label: "GMT" },
];

function toEventsTime(value: string | undefined): EventsTime {
	return value === "local" || value === "gmt" ? value : "autodetect";
}

// The stock UI treats every value other than "yes" as off; system.conf itself
// only ever holds "yes"/"no".
function toYesNo(value: string | undefined): YesNo {
	return value === "yes" ? "yes" : "no";
}

// get_configs returns a loose string map. Missing or unrecognised values fall
// back to the defaults of the shipped system.conf template rather than blanking
// the control.
export function toRecordingSettings(
	conf: Record<string, string>,
): RecordingSettings {
	return {
		FREE_SPACE: conf.FREE_SPACE ?? "0",
		EVENTS_TIME: toEventsTime(conf.EVENTS_TIME),
		FTP_UPLOAD: toYesNo(conf.FTP_UPLOAD),
		FTP_FILE_DELETE_AFTER_UPLOAD: toYesNo(conf.FTP_FILE_DELETE_AFTER_UPLOAD),
		FTP_DIR_TREE: toYesNo(conf.FTP_DIR_TREE),
		FTP_HOST: conf.FTP_HOST ?? "",
		FTP_DIR: conf.FTP_DIR ?? "",
		FTP_USERNAME: conf.FTP_USERNAME ?? "",
		FTP_PASSWORD: conf.FTP_PASSWORD ?? "",
	};
}
