import { z } from "zod";
import type { GetConfigsResponse, MqttConf, YesNo } from "@/api";
import { pickStrings } from "@/features/mqtt/helpers/conf-record";
import { confValue, sameShape } from "@/features/mqtt/helpers/conf-schema";

// The mqttv4.conf keys the stock mqtt page edits. `satisfies` ties them to the
// generated MqttConf, so an upstream rename breaks the build here instead of
// writing a key the firmware ignores. BABY_CRYING_MSG is in the file but has
// no stock control; the merged save leaves it untouched.
export const MQTT_CONF_KEYS = [
	"MQTT_IP",
	"MQTT_PORT",
	"MQTT_TLS",
	"MQTT_CLIENT_ID",
	"MQTT_USER",
	"MQTT_PASSWORD",
	"MQTT_PREFIX",
	"TOPIC_BIRTH_WILL",
	"BIRTH_MSG",
	"WILL_MSG",
	"TOPIC_MOTION",
	"MOTION_START_MSG",
	"MOTION_STOP_MSG",
	"AI_HUMAN_DETECTION_MSG",
	"AI_VEHICLE_DETECTION_MSG",
	"AI_ANIMAL_DETECTION_MSG",
	"TOPIC_MOTION_IMAGE",
	"MOTION_IMAGE_DELAY",
	"TOPIC_MOTION_FILES",
	"TOPIC_SOUND_DETECTION",
	"SOUND_DETECTION_MSG",
	"MQTT_KEEPALIVE",
	"MQTT_QOS",
	"MQTT_RETAIN_BIRTH_WILL",
	"MQTT_RETAIN_MOTION",
	"MQTT_RETAIN_MOTION_IMAGE",
	"MQTT_RETAIN_MOTION_FILES",
	"MQTT_RETAIN_SOUND_DETECTION",
] as const satisfies readonly (keyof MqttConf)[];

export type MqttFormValues = Record<(typeof MQTT_CONF_KEYS)[number], string> & {
	// The master switch is the MQTT key of system.conf, not of mqttv4.conf. It
	// rides along in this form and is written by a second POST, exactly as the
	// stock page does it.
	MQTT: YesNo;
};

export type MqttFieldName = keyof MqttFormValues;

export const MQTT_FORM_DEFAULTS: MqttFormValues = {
	...pickStrings({}, MQTT_CONF_KEYS),
	MQTT: "no",
};

export function toMqttFormValues(
	record: GetConfigsResponse,
	enabled: YesNo,
): MqttFormValues {
	return { ...pickStrings(record, MQTT_CONF_KEYS), MQTT: enabled };
}

// The whole record with the edited keys overwritten: set_configs only rewrites
// the keys it receives, so re-sending the untouched ones is a no-op that keeps
// the write independent of which keys this page happens to render.
export function toMqttConfBody(
	record: GetConfigsResponse,
	values: MqttFormValues,
): Record<string, string> {
	const { MQTT: _systemFlag, ...confValues } = values;
	return { ...record, ...confValues };
}

// mqtt-config.c parses these three with strtol, and the CGI never validates a
// value: an out-of-range one is stored and only the daemon notices.
const port = z
	.string()
	.regex(/^\d+$/, "Use a port number")
	.refine(
		(value) => Number(value) >= 1 && Number(value) <= 65535,
		"Ports run from 1 to 65535",
	);

const keepalive = z
	.string()
	.regex(/^\d+$/, "Use a number of seconds")
	.refine(
		(value) => Number(value) >= 1 && Number(value) <= 65535,
		"Keepalive runs from 1 to 65535 seconds",
	);

// set_configs writes MOTION_IMAGE_DELAY only when it parses as a number <= 5.0
// (it accepts a comma as the decimal separator); anything else is dropped
// silently and the call still answers error=false.
const motionImageDelay = z
	.string()
	.regex(/^\d+([.,]\d+)?$/, "Use a number of seconds, for example 0.5")
	.refine(
		(value) => Number(value.replace(",", ".")) <= 5,
		"The camera ignores a delay above 5 seconds",
	);

export const mqttFormSchema = z.object({
	...sameShape(MQTT_CONF_KEYS, confValue),
	MQTT: z.enum(["yes", "no"]),
	MQTT_PORT: port,
	MQTT_KEEPALIVE: keepalive,
	MOTION_IMAGE_DELAY: motionImageDelay,
});
