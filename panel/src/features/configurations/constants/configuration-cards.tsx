import { Anchor, Code, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import type { CardSpec } from "@/features/configurations/helpers/config-fields";

const SWAPPINESS_VALUES = [
	"0",
	"1",
	"5",
	"10",
	"15",
	"20",
	"25",
	"30",
	"35",
	"40",
	"45",
	"50",
	"55",
	"60",
	"65",
	"70",
	"75",
	"80",
	"85",
	"90",
	"95",
	"100",
];

const CRONTAB_LEGEND = `# +------------ Minute            (range: 0-59)
# | +---------- Hour              (range: 0-23)
# | | +-------- Day of the Month  (range: 1-31)
# | | | +------ Month of the Year (range: 1-12)
# | | | | +---- Day of the Week   (range: 0-6, sunday to saturday)
# | | | | |
# * * * * * <command to execute>`;

// Allowed by the firmware's key/value validators, per the stock page's own
// note next to the password and crontab fields.
const ALLOWED_SPECIAL_CHARS = `\\ | ! " $ % & / ( ) ' ? ^ [ ] @ < > , ; . : - _ *`;

type Params = {
	// status.json go2rtc flag: the option is dropped only when the camera
	// answers "no", exactly like the stock page does.
	go2rtcSupported: boolean;
};

export function configurationCards({ go2rtcSupported }: Params): CardSpec[] {
	return [
		{
			title: "General",
			fields: [
				{
					kind: "text",
					key: "HOSTNAME",
					label: "Hostname",
					description:
						"Camera's hostname on the network. Leave blank to generate one automatically.",
				},
				{
					kind: "text",
					key: "TIMEZONE",
					label: "Timezone",
					description: (
						<>
							POSIX timezone string. Look yours up on the{" "}
							<Anchor component={Link} to="/tz" inherit>
								Time Zone
							</Anchor>{" "}
							page and copy it here.
						</>
					),
				},
				{
					kind: "switch",
					key: "DISABLE_CLOUD",
					label: "Disable Cloud",
					description:
						"Disable the Yi app and all cloud features (aka private mode).",
				},
				{
					kind: "switch",
					key: "REC_WITHOUT_CLOUD",
					label: "Recording without Cloud",
					description:
						"Record on the SD card even with the cloud disabled. Takes effect only if Disable Cloud is on.",
				},
				{
					kind: "switch",
					key: "RTSP",
					label: "RTSP",
					description: "Enable the RTSP server.",
				},
				{
					kind: "select",
					key: "RTSP_ALT",
					label: "RTSP server program",
					description: "go2rtc supports aac audio only.",
					options: [
						{
							value: "standard",
							label: "Standard (based on live555 library)",
						},
						{ value: "alternative", label: "Alternative" },
						...(go2rtcSupported ? [{ value: "go2rtc", label: "go2rtc" }] : []),
					],
				},
				{
					kind: "select",
					key: "RTSP_STREAM",
					label: "RTSP Stream",
					description: "Stream resolution served by the RTSP server.",
					options: [
						{ value: "high", label: "High" },
						{ value: "low", label: "Low" },
						{ value: "both", label: "Both" },
					],
				},
				{
					kind: "select",
					key: "RTSP_AUDIO",
					label: "RTSP Audio",
					description: "Audio codec for the RTSP stream.",
					// system.conf ships RTSP_AUDIO=yes and links.sh enables audio for
					// anything that is not "no" or "none", so "yes" is a live value on a
					// stock camera. The stock UI omits it, which leaves its select blank
					// and unable to show the camera's real setting — offer it here so the
					// shipped default round-trips.
					options: [
						{ value: "no", label: "Disabled (default)" },
						{ value: "yes", label: "Enabled (firmware default codec)" },
						{ value: "pcm", label: "pcm" },
						{ value: "alaw", label: "alaw" },
						{ value: "ulaw", label: "ulaw" },
						{ value: "aac", label: "aac" },
					],
				},
				{
					kind: "switch",
					key: "ONVIF",
					label: "ONVIF",
					description: (
						<>
							Enable the ONVIF server. Its own options live on the{" "}
							<Anchor component={Link} to="/configurations-onvif" inherit>
								ONVIF
							</Anchor>{" "}
							page.
						</>
					),
				},
				{
					kind: "switch",
					key: "TIME_OSD",
					label: "Enable time OSD",
					description:
						"Draw the time in the upper left corner. Only works if the camera has no native OSD, and shifts the timeline in the Yi app.",
				},
				{
					kind: "switch",
					key: "CUSTOM_WATERMARK",
					label: "Hide watermark",
					description:
						"Replace the camera's built-in watermark with a blank image.",
				},
			],
		},
		{
			title: "Snapshot",
			fields: [
				{
					kind: "switch",
					key: "SNAPSHOT",
					label: "Snapshot",
					description:
						"Enable the snapshot feature. Enable the swap file too, to avoid memory problems.",
				},
				{
					kind: "switch",
					key: "SNAPSHOT_VIDEO",
					label: "Snapshot for recorded video",
					description: "Create a snapshot for each recorded video (CPU heavy).",
				},
				{
					kind: "switch",
					key: "SNAPSHOT_LOW",
					label: "Force low resolution snapshot",
					description:
						"Take low resolution snapshots only, which avoids memory problems.",
				},
				{
					kind: "switch",
					key: "TIMELAPSE",
					label: "Time-lapse",
					description: (
						<>
							Enable time-lapse snapshots. Finished videos are listed on the{" "}
							<Anchor component={Link} to="/timelapse" inherit>
								Timelapse
							</Anchor>{" "}
							page.
						</>
					),
				},
				{
					kind: "text",
					key: "TIMELAPSE_DT",
					label: "Time-lapse interval",
					description:
						"Minutes between frames: 1-6, 10, 15, 20, 30, 60, 120, 180, 240, 360, 1440. With 1440 add an offset from midnight as 1440+offset (noon is 1440+720).",
				},
				{
					kind: "text",
					key: "TIMELAPSE_VDT",
					label: "Time-lapse video creation interval",
					description:
						'Crontab syntax, e.g. "0 0 * * *" for a video every midnight. Disabled when empty or when Time-lapse ftp push is on.',
				},
				{
					kind: "switch",
					key: "TIMELAPSE_FTP",
					label: "Time-lapse ftp push",
					description:
						"Send each time-lapse snapshot to the ftp server (configured on the Events page) and delete the local file.",
				},
				{
					kind: "switch",
					key: "TIMELAPSE_FTP_SAME_NAME",
					label: "Overwrite ftp destination file (use same name)",
					description:
						"Send time-lapse snapshots to the ftp server always under the same name.",
				},
			],
		},
		{
			title: "Advanced",
			fields: [
				{
					kind: "switch",
					key: "SSHD",
					label: "SSH",
					description: "Enable or disable the SSH server.",
				},
				{
					kind: "switch",
					key: "FTPD",
					label: "FTP",
					description: "Enable or disable the FTP server.",
				},
				{
					kind: "switch",
					key: "BUSYBOX_FTPD",
					label: "Legacy FTP",
					description: (
						<>
							Switch to the legacy BusyBox FTP server instead of Pure-FTPd (see{" "}
							<Anchor
								href="https://github.com/shadow-1/yi-hack-v3/issues/129#issuecomment-361723075"
								target="_blank"
								rel="noreferrer"
								inherit
							>
								this issue
							</Anchor>
							).
						</>
					),
				},
				{
					kind: "switch",
					key: "TELNETD",
					label: "Telnet",
					description: "Enable or disable the Telnet server.",
				},
				{
					kind: "switch",
					key: "NTPD",
					label: "NTPD",
					description:
						"Network Time Protocol daemon. Required to keep the clock in sync when the cloud features are disabled.",
				},
				{
					kind: "text",
					key: "NTP_SERVER",
					label: "NTP Server",
					description: "NTP server name.",
				},
				{
					kind: "switch",
					key: "HTTPD",
					label: "HTTPD",
					description:
						"Enable or disable the web server. Turning it off makes this panel unreachable after the reboot.",
				},
				{
					kind: "switch",
					key: "MDNSD",
					label: "MDNSD",
					description: "Enable or disable the Multicast DNS daemon.",
				},
				{
					kind: "switch",
					key: "PROXYCHAINSNG",
					label: "Proxychains-ng",
					description: (
						<>
							Bypass the region restrictions Yi imposes on Chinese cameras used
							outside China. Servers are configured on the{" "}
							<Anchor component={Link} to="/proxy" inherit>
								Proxy
							</Anchor>{" "}
							page.
						</>
					),
				},
				{
					kind: "switch",
					key: "SWAP_FILE",
					label: "Swap File",
					description:
						"Create /tmp/sd/swapfile on the SD card to expand the available memory.",
				},
				{
					kind: "select",
					key: "SWAP_SWAPPINESS",
					label: "Swap swappiness value",
					description: "vm.swappiness sysctl value (default 15).",
					options: SWAPPINESS_VALUES.map((value) => ({
						value,
						label: value,
					})),
				},
				{
					kind: "switch",
					key: "KERNEL_TUNING",
					label: "Kernel tuning",
					description: "Enable kernel tuning to optimise the SD card.",
				},
			],
		},
		{
			title: "TCP ports",
			fields: [
				{
					kind: "text",
					key: "RTSP_PORT",
					label: "RTSP Port",
					description: "TCP port used by the RTSP server (default 554).",
				},
				{
					kind: "text",
					key: "HTTPD_PORT",
					label: "HTTPD Port",
					description: "TCP port used by the web server (default 80).",
				},
			],
		},
		{
			title: "Authentication",
			fields: [
				{
					kind: "text",
					key: "USERNAME",
					label: "Username",
					description:
						"Username for RTSP, ONVIF and HTTP access (default empty).",
				},
				{
					kind: "password",
					key: "PASSWORD",
					label: "Password",
					description: (
						<>
							Password for RTSP, ONVIF and HTTP access (default empty). Allowed
							special chars: <Code>{ALLOWED_SPECIAL_CHARS}</Code>
						</>
					),
				},
				{
					kind: "password",
					key: "SSH_PASSWORD",
					label: "Root Password",
					description: (
						<>
							Password for the SSH, Telnet and FTP root user (default empty).
							Allowed special chars: <Code>{ALLOWED_SPECIAL_CHARS}</Code>
						</>
					),
				},
			],
		},
		{
			title: "Expert",
			fields: [
				{
					kind: "textarea",
					key: "CRONTAB",
					label: "Crontab",
					rows: 4,
					description: (
						<>
							{/* A span, not a pre: Mantine renders input descriptions
							    inside a <p>, which cannot contain block elements. */}
							<Text
								component="span"
								size="xs"
								ff="monospace"
								display="block"
								style={{ whiteSpace: "pre" }}
								my="xs"
							>
								{CRONTAB_LEGEND}
							</Text>
							Scheduled processes in crontab syntax. Allowed special chars:{" "}
							<Code>{ALLOWED_SPECIAL_CHARS}</Code>
						</>
					),
				},
				{
					kind: "switch",
					key: "DEBUG_LOG",
					label: "Debug log",
					description:
						"Log the init script to /tmp/sd/hack_debug.log during boot.",
				},
			],
		},
	];
}
