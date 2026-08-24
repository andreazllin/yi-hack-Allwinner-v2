import type { CardSpec } from "@/features/configurations/helpers/config-fields";

// ONVIF_FAULT_IF_SET exists in system.conf but the stock page does not expose
// it, so it is not offered here either — it still survives a save because the
// whole record is posted back.
export const ONVIF_CARDS: CardSpec[] = [
	{
		title: "General",
		fields: [
			{
				kind: "switch",
				key: "ONVIF_WSDD",
				label: "ONVIF WS-Discovery",
				description: "Enable the WS-Discovery daemon for the ONVIF service.",
			},
			{
				kind: "select",
				key: "ONVIF_PROFILE",
				label: "ONVIF Profile",
				description: "Resolution advertised as the ONVIF profile.",
				options: [
					{ value: "high", label: "High" },
					{ value: "low", label: "Low" },
					{ value: "both", label: "Both" },
				],
			},
			{
				kind: "select",
				key: "ONVIF_NETIF",
				label: "ONVIF Network Interface",
				description: "Interface the ONVIF service binds to.",
				options: [
					{ value: "eth0", label: "Ethernet" },
					{ value: "wlan0", label: "Wireless" },
				],
			},
			{
				kind: "switch",
				key: "ONVIF_WM_SNAPSHOT",
				label: "ONVIF watermark",
				description: "Add the watermark to the snapshot.",
			},
			{
				kind: "select",
				key: "ONVIF_AUDIO_BC",
				label: "ONVIF audio decoder (backchannel)",
				description: "Codec for the audio back channel.",
				options: [
					{ value: "NONE", label: "NONE" },
					{ value: "G711", label: "G711" },
					{ value: "AAC", label: "AAC" },
				],
			},
			{
				kind: "switch",
				key: "ONVIF_ENABLE_MEDIA2",
				label: "Enable Media2",
				description: "Enable Media2 configuration and streaming.",
			},
			{
				kind: "switch",
				key: "ONVIF_FAULT_IF_UNKNOWN",
				label: "Fault response if unknown request",
				description: "Reply with a fault response to an unknown request.",
			},
			{
				kind: "switch",
				key: "ONVIF_SYNOLOGY_NVR",
				label: "Synology NVR compatibility",
				description: "Improve compatibility with Synology NVRs.",
			},
		],
	},
];
