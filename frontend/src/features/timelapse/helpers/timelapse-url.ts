import { cameraPath } from "@/lib/camera-url";

// Time-lapse .avi files are served straight off the SD card by BusyBox httpd
// at /record/timelapse/, not through a CGI script — no SDK call involved.
export function timelapseFileUrl(filename: string): string {
	return cameraPath(`/record/timelapse/${encodeURIComponent(filename)}`);
}
