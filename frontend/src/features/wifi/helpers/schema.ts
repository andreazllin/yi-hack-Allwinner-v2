import { z } from "zod";

// configure_wifi.sh writes the SSID and the passphrase into 64-byte slots of
// the flash partition and bails out above 63 characters — but wifi.sh reports
// error=false regardless of that exit code, so an over-long value would look
// saved and silently not be.
const MAX_LENGTH = 63;

export const wifiSchema = z
	.object({
		WIFI_ESSID: z
			.string()
			.min(1, { error: "Pick a scanned network or type an ESSID." })
			.max(MAX_LENGTH, {
				error: `The camera cannot store an ESSID longer than ${MAX_LENGTH} characters.`,
			}),
		WIFI_PASSWORD: z
			.string()
			.min(1, { error: "Enter the network passphrase." })
			.max(MAX_LENGTH, {
				error: `The camera cannot store a passphrase longer than ${MAX_LENGTH} characters.`,
			}),
		WIFI_PASSWORD2: z.string(),
	})
	// wifi.sh compares the two and refuses the whole save when they differ.
	.refine((value) => value.WIFI_PASSWORD === value.WIFI_PASSWORD2, {
		error: "The two passwords do not match.",
		path: ["WIFI_PASSWORD2"],
	});

export type WifiForm = z.infer<typeof wifiSchema>;

export const EMPTY_WIFI_FORM: WifiForm = {
	WIFI_ESSID: "",
	WIFI_PASSWORD: "",
	WIFI_PASSWORD2: "",
};
