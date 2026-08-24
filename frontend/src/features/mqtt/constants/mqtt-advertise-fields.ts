import {
	QOS_DESCRIPTION,
	QOS_OPTIONS,
	RETAIN_DESCRIPTION,
	RETAIN_OPTIONS,
} from "@/features/mqtt/constants/mqtt-options";
import type { ConfigSectionSpec } from "@/features/mqtt/helpers/field-spec";
import type { MqttAdvertiseFieldName } from "@/features/mqtt/helpers/mqtt-advertise-form";

const CRONTAB_DESCRIPTION =
	"Crontab schedule: minute hour day-of-month month day-of-week.";

type AdvertiseGroup = {
	title: string;
	description: string;
	// The key prefix of the group; every group has the same seven keys.
	prefix:
		| "MQTT_ADV_INFO_GLOBAL"
		| "MQTT_ADV_LINK"
		| "MQTT_ADV_CAMERA_SETTING"
		| "MQTT_ADV_TELEMETRY";
	topicPlaceholder: string;
};

// The four advertise groups of the stock mqtt_adv page differ only by key
// prefix and copy — same seven controls each.
function advertiseSection(
	group: AdvertiseGroup,
): ConfigSectionSpec<MqttAdvertiseFieldName> {
	return {
		title: group.title,
		description: group.description,
		fields: [
			{ kind: "switch", name: `${group.prefix}_ENABLE`, label: "Enabled" },
			{ kind: "switch", name: `${group.prefix}_BOOT`, label: "Start on boot" },
			{ kind: "switch", name: `${group.prefix}_CRON`, label: "Periodic start" },
			{
				kind: "text",
				name: `${group.prefix}_CRONTAB`,
				label: "Crontab",
				placeholder: "0 * * * *",
				description: CRONTAB_DESCRIPTION,
			},
			{
				kind: "text",
				name: `${group.prefix}_TOPIC`,
				label: "Suffix topic",
				placeholder: group.topicPlaceholder,
			},
			{
				kind: "select",
				name: `${group.prefix}_RETAIN`,
				label: "Retain",
				description: RETAIN_DESCRIPTION,
				options: RETAIN_OPTIONS,
			},
			{
				kind: "select",
				name: `${group.prefix}_QOS`,
				label: "QoS",
				description: QOS_DESCRIPTION,
				options: QOS_OPTIONS,
			},
		],
	};
}

// Section order and copy of the stock mqtt_adv page (audit "mqtt_adv").
export const MQTT_ADVERTISE_SECTIONS: ConfigSectionSpec<MqttAdvertiseFieldName>[] =
	[
		advertiseSection({
			title: "MQTT information advertise",
			description:
				"Values that rarely change: hostname, firmware version, base version, model suffix, serial number, address, netmask, gateway, MAC address, WiFi ESSID.",
			prefix: "MQTT_ADV_INFO_GLOBAL",
			topicPlaceholder: "info_global",
		}),
		advertiseSection({
			title: "MQTT link advertise",
			description:
				"The stream and snapshot links: high res stream, low res stream, audio only stream, high res snapshot, low res snapshot.",
			prefix: "MQTT_ADV_LINK",
			topicPlaceholder: "links",
		}),
		advertiseSection({
			title: "MQTT camera settings advertise",
			description:
				"The values of the Camera Settings page: camera on/off, sound detection, status LED, IR LED, rotate.",
			prefix: "MQTT_ADV_CAMERA_SETTING",
			topicPlaceholder: "camera_setting",
		}),
		advertiseSection({
			title: "MQTT telemetry advertise",
			description:
				"Values that change often: WiFi strength, uptime, free SD space, free memory, total memory, load average.",
			prefix: "MQTT_ADV_TELEMETRY",
			topicPlaceholder: "telemetry",
		}),
		{
			title: "Home Assistant",
			description:
				"MQTT discovery lets Home Assistant add this camera with almost no configuration on its side.",
			fields: [
				{ kind: "switch", name: "HOMEASSISTANT_ENABLE", label: "Enabled" },
				{ kind: "switch", name: "HOMEASSISTANT_BOOT", label: "Start on boot" },
				{ kind: "switch", name: "HOMEASSISTANT_CRON", label: "Periodic start" },
				{
					kind: "text",
					name: "HOMEASSISTANT_CRONTAB",
					label: "Crontab",
					placeholder: "*/10 * * * *",
					description: CRONTAB_DESCRIPTION,
				},
				{
					kind: "text",
					name: "HOMEASSISTANT_MQTT_PREFIX",
					label: "Prefix topic",
					placeholder: "homeassistant",
				},
				{
					kind: "text",
					name: "HOMEASSISTANT_NAME",
					label: "Device name",
					placeholder: "YI Camera",
				},
				{
					kind: "text",
					name: "HOMEASSISTANT_IDENTIFIERS",
					label: "Device id",
					placeholder: "yi-cam",
					description: "Unique id of the device. It must not contain spaces.",
				},
				{
					kind: "text",
					name: "HOMEASSISTANT_MANUFACTURER",
					label: "Device manufacturer",
					placeholder: "YI Hack",
				},
				{
					kind: "text",
					name: "HOMEASSISTANT_MODEL",
					label: "Model name",
					placeholder: "Y",
				},
				{
					kind: "select",
					name: "HOMEASSISTANT_RETAIN",
					label: "Retain",
					description: RETAIN_DESCRIPTION,
					options: RETAIN_OPTIONS,
				},
				{
					kind: "select",
					name: "HOMEASSISTANT_QOS",
					label: "QoS",
					description: QOS_DESCRIPTION,
					options: QOS_OPTIONS,
				},
			],
		},
	];
