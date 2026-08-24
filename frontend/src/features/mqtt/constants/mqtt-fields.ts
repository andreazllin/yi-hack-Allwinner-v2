import {
	QOS_DESCRIPTION,
	QOS_OPTIONS,
	RETAIN_DESCRIPTION,
	RETAIN_OPTIONS,
} from "@/features/mqtt/constants/mqtt-options";
import type { ConfigSectionSpec } from "@/features/mqtt/helpers/field-spec";
import type { MqttFieldName } from "@/features/mqtt/helpers/mqtt-form";

// mqtt-config.c reads MQTT_TLS with strtol and enables TLS only on "1".
const TLS_OPTIONS = [
	{ value: "0", label: "0 — plain TCP" },
	{ value: "1", label: "1 — TLS" },
];

// The sections and labels of the stock mqtt page (audit "mqtt"), in the same
// order; its four 'Topics' row groups become their own sections.
export const MQTT_SECTIONS: ConfigSectionSpec<MqttFieldName>[] = [
	{
		title: "General",
		fields: [
			{
				kind: "switch",
				name: "MQTT",
				label: "Enabled",
				description:
					"Runs the MQTT client. This switch is the MQTT key of the system config, not of the MQTT config.",
			},
			{
				kind: "text",
				name: "MQTT_IP",
				label: "Server IP",
				description: "Address of the MQTT broker.",
			},
			{
				kind: "text",
				name: "MQTT_PORT",
				label: "Server port",
				placeholder: "1883",
			},
			{
				kind: "select",
				name: "MQTT_TLS",
				label: "TLS",
				description: "Copy your ca.crt into /tmp/sd/yi-hack/etc/mqtt/.",
				options: TLS_OPTIONS,
			},
			{
				kind: "text",
				name: "MQTT_CLIENT_ID",
				label: "Client ID",
				description: "Must be unique on the network.",
			},
		],
	},
	{
		title: "Authentication",
		fields: [
			{ kind: "text", name: "MQTT_USER", label: "Username" },
			{ kind: "password", name: "MQTT_PASSWORD", label: "Password" },
		],
	},
	{
		title: "Topics",
		description:
			"Every message is published to prefix/suffix, for example yicam/motion_detection.",
		fields: [
			{
				kind: "text",
				name: "MQTT_PREFIX",
				label: "Topics prefix",
				placeholder: "yicam",
			},
		],
	},
	{
		title: "Birth and will messages",
		fields: [
			{ kind: "text", name: "TOPIC_BIRTH_WILL", label: "Topic suffix" },
			{ kind: "text", name: "BIRTH_MSG", label: "Birth message" },
			{ kind: "text", name: "WILL_MSG", label: "Will message" },
		],
	},
	{
		title: "Motion",
		fields: [
			{ kind: "text", name: "TOPIC_MOTION", label: "Topic suffix" },
			{ kind: "text", name: "MOTION_START_MSG", label: "Motion start message" },
			{ kind: "text", name: "MOTION_STOP_MSG", label: "Motion stop message" },
			{
				kind: "text",
				name: "AI_HUMAN_DETECTION_MSG",
				label: "AI human detection message",
			},
			{
				kind: "text",
				name: "AI_VEHICLE_DETECTION_MSG",
				label: "AI vehicle detection message",
			},
			{
				kind: "text",
				name: "AI_ANIMAL_DETECTION_MSG",
				label: "AI animal detection message",
			},
			{
				kind: "text",
				name: "TOPIC_MOTION_IMAGE",
				label: "Topic suffix for jpeg image",
				description: "A raw jpeg is published here when motion is detected.",
			},
			{
				kind: "text",
				name: "MOTION_IMAGE_DELAY",
				label: "Delay between motion detection and snapshot (s)",
				description: "The camera stores this only when it is 5.0 or less.",
			},
			{
				kind: "text",
				name: "TOPIC_MOTION_FILES",
				label: "Topic suffix for video list message",
			},
		],
	},
	{
		title: "Sound detection",
		fields: [
			{ kind: "text", name: "TOPIC_SOUND_DETECTION", label: "Topic suffix" },
			{
				kind: "text",
				name: "SOUND_DETECTION_MSG",
				label: "Sound detection message",
			},
		],
	},
	{
		title: "Advanced",
		fields: [
			{
				kind: "text",
				name: "MQTT_KEEPALIVE",
				label: "Keepalive (s)",
				placeholder: "120",
				description:
					"How often the client and the broker confirm the connection is still open.",
			},
			{
				kind: "select",
				name: "MQTT_QOS",
				label: "QoS",
				description: QOS_DESCRIPTION,
				options: QOS_OPTIONS,
			},
			{
				kind: "select",
				name: "MQTT_RETAIN_BIRTH_WILL",
				label: "Retain birth and will messages",
				description: RETAIN_DESCRIPTION,
				options: RETAIN_OPTIONS,
			},
			{
				kind: "select",
				name: "MQTT_RETAIN_MOTION",
				label: "Retain motion messages",
				options: RETAIN_OPTIONS,
			},
			{
				kind: "select",
				name: "MQTT_RETAIN_MOTION_IMAGE",
				label: "Retain motion image messages",
				options: RETAIN_OPTIONS,
			},
			{
				kind: "select",
				name: "MQTT_RETAIN_MOTION_FILES",
				label: "Retain video list messages",
				options: RETAIN_OPTIONS,
			},
			{
				kind: "select",
				name: "MQTT_RETAIN_SOUND_DETECTION",
				label: "Retain sound detection messages",
				options: RETAIN_OPTIONS,
			},
		],
	},
];
