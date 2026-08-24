import { z } from "zod";
import type { GetConfigsResponse, MqttAdvertiseConf, YesNo } from "@/api";
import { pickStrings, pickYesNo } from "@/features/mqtt/helpers/conf-record";
import {
	confValue,
	EQUALS_MESSAGE,
	noEquals,
	sameShape,
} from "@/features/mqtt/helpers/conf-schema";

// The yes/no keys of mqtt_advertise.conf: three per advertise group plus three
// for Home Assistant discovery. `satisfies` ties them to the generated shape.
export const MQTT_ADVERTISE_SWITCH_KEYS = [
	"MQTT_ADV_INFO_GLOBAL_ENABLE",
	"MQTT_ADV_INFO_GLOBAL_BOOT",
	"MQTT_ADV_INFO_GLOBAL_CRON",
	"MQTT_ADV_LINK_ENABLE",
	"MQTT_ADV_LINK_BOOT",
	"MQTT_ADV_LINK_CRON",
	"MQTT_ADV_CAMERA_SETTING_ENABLE",
	"MQTT_ADV_CAMERA_SETTING_BOOT",
	"MQTT_ADV_CAMERA_SETTING_CRON",
	"MQTT_ADV_TELEMETRY_ENABLE",
	"MQTT_ADV_TELEMETRY_BOOT",
	"MQTT_ADV_TELEMETRY_CRON",
	"HOMEASSISTANT_ENABLE",
	"HOMEASSISTANT_BOOT",
	"HOMEASSISTANT_CRON",
] as const satisfies readonly (keyof MqttAdvertiseConf)[];

// Everything else in the file: crontabs, topics, retain/QoS and the Home
// Assistant device identity.
export const MQTT_ADVERTISE_TEXT_KEYS = [
	"MQTT_ADV_INFO_GLOBAL_CRONTAB",
	"MQTT_ADV_INFO_GLOBAL_TOPIC",
	"MQTT_ADV_INFO_GLOBAL_RETAIN",
	"MQTT_ADV_INFO_GLOBAL_QOS",
	"MQTT_ADV_LINK_CRONTAB",
	"MQTT_ADV_LINK_TOPIC",
	"MQTT_ADV_LINK_RETAIN",
	"MQTT_ADV_LINK_QOS",
	"MQTT_ADV_CAMERA_SETTING_CRONTAB",
	"MQTT_ADV_CAMERA_SETTING_TOPIC",
	"MQTT_ADV_CAMERA_SETTING_RETAIN",
	"MQTT_ADV_CAMERA_SETTING_QOS",
	"MQTT_ADV_TELEMETRY_CRONTAB",
	"MQTT_ADV_TELEMETRY_TOPIC",
	"MQTT_ADV_TELEMETRY_RETAIN",
	"MQTT_ADV_TELEMETRY_QOS",
	"HOMEASSISTANT_CRONTAB",
	"HOMEASSISTANT_MQTT_PREFIX",
	"HOMEASSISTANT_NAME",
	"HOMEASSISTANT_IDENTIFIERS",
	"HOMEASSISTANT_MANUFACTURER",
	"HOMEASSISTANT_MODEL",
	"HOMEASSISTANT_RETAIN",
	"HOMEASSISTANT_QOS",
] as const satisfies readonly (keyof MqttAdvertiseConf)[];

export type MqttAdvertiseFormValues = Record<
	(typeof MQTT_ADVERTISE_TEXT_KEYS)[number],
	string
> &
	Record<(typeof MQTT_ADVERTISE_SWITCH_KEYS)[number], YesNo>;

export type MqttAdvertiseFieldName = keyof MqttAdvertiseFormValues;

export const MQTT_ADVERTISE_FORM_DEFAULTS: MqttAdvertiseFormValues = {
	...pickStrings({}, MQTT_ADVERTISE_TEXT_KEYS),
	...pickYesNo({}, MQTT_ADVERTISE_SWITCH_KEYS),
};

export function toMqttAdvertiseFormValues(
	record: GetConfigsResponse,
): MqttAdvertiseFormValues {
	return {
		...pickStrings(record, MQTT_ADVERTISE_TEXT_KEYS),
		...pickYesNo(record, MQTT_ADVERTISE_SWITCH_KEYS),
	};
}

// Same merge as the mqtt page: the whole record with the edited keys on top.
export function toMqttAdvertiseConfBody(
	record: GetConfigsResponse,
	values: MqttAdvertiseFormValues,
): Record<string, string> {
	return { ...record, ...values };
}

// startup.sh appends the script path to this value before writing it into
// /var/spool/cron/crontabs/root, so the value is the 5-field schedule alone.
const crontab = z
	.string()
	.regex(
		/^\S+(\s+\S+){4}$/,
		"Use 5 crontab fields: minute hour day-of-month month day-of-week",
	)
	.refine(noEquals, EQUALS_MESSAGE);

// The advertise scripts interpolate this id unquoted, and the stock page says
// it must not contain spaces.
const deviceId = z
	.string()
	.regex(/^\S*$/, "The device id must not contain spaces")
	.refine(noEquals, EQUALS_MESSAGE);

export const mqttAdvertiseFormSchema = z.object({
	...sameShape(MQTT_ADVERTISE_TEXT_KEYS, confValue),
	...sameShape(MQTT_ADVERTISE_SWITCH_KEYS, z.enum(["yes", "no"])),
	MQTT_ADV_INFO_GLOBAL_CRONTAB: crontab,
	MQTT_ADV_LINK_CRONTAB: crontab,
	MQTT_ADV_CAMERA_SETTING_CRONTAB: crontab,
	MQTT_ADV_TELEMETRY_CRONTAB: crontab,
	HOMEASSISTANT_CRONTAB: crontab,
	HOMEASSISTANT_IDENTIFIERS: deviceId,
});
