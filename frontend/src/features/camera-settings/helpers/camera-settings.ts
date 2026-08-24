import type { AnyFieldMeta } from "@tanstack/react-form";
import { z } from "zod";
import type { SetCameraSettingsData } from "@/api";
import {
	APPLY_CRUISE_EXTRA_MS,
	APPLY_PARAM_SLOTS,
	APPLY_SWITCH_OFF_EXTRA_MS,
	APPLY_TICK_MS,
	CAMERA_SETTING_KEYS,
	CAMERA_SETTINGS_DEFAULTS,
	type CameraSettingsDraft,
	SETTING_COPY,
} from "../constants/camera-settings";

const yesNo = z.enum(["yes", "no"]);

// Every field falls back to its template default instead of failing the whole
// parse: camera.conf is written by the mobile app, by older firmwares and by
// hand, so a missing or out-of-domain value is expected rather than
// exceptional - and echoing such a value back to camera_settings.sh would be
// dropped silently, leaving the UI claiming a setting it never applied.
// Unknown keys (HOMEVER, anything else in the file) are stripped by z.object.
const cameraConfSchema = z.object({
	SWITCH_ON: yesNo.catch(CAMERA_SETTINGS_DEFAULTS.SWITCH_ON),
	SAVE_VIDEO_ON_MOTION: yesNo.catch(
		CAMERA_SETTINGS_DEFAULTS.SAVE_VIDEO_ON_MOTION,
	),
	MOTION_DETECTION: yesNo.catch(CAMERA_SETTINGS_DEFAULTS.MOTION_DETECTION),
	SENSITIVITY: z
		.enum(["low", "medium", "high"])
		.catch(CAMERA_SETTINGS_DEFAULTS.SENSITIVITY),
	AI_HUMAN_DETECTION: yesNo.catch(CAMERA_SETTINGS_DEFAULTS.AI_HUMAN_DETECTION),
	AI_VEHICLE_DETECTION: yesNo.catch(
		CAMERA_SETTINGS_DEFAULTS.AI_VEHICLE_DETECTION,
	),
	AI_ANIMAL_DETECTION: yesNo.catch(
		CAMERA_SETTINGS_DEFAULTS.AI_ANIMAL_DETECTION,
	),
	FACE_DETECTION: yesNo.catch(CAMERA_SETTINGS_DEFAULTS.FACE_DETECTION),
	MOTION_TRACKING: yesNo.catch(CAMERA_SETTINGS_DEFAULTS.MOTION_TRACKING),
	SOUND_DETECTION: yesNo.catch(CAMERA_SETTINGS_DEFAULTS.SOUND_DETECTION),
	SOUND_SENSITIVITY: z
		.enum(["30", "35", "40", "45", "50", "60", "70", "80", "90"])
		.catch(CAMERA_SETTINGS_DEFAULTS.SOUND_SENSITIVITY),
	LED: yesNo.catch(CAMERA_SETTINGS_DEFAULTS.LED),
	ROTATE: yesNo.catch(CAMERA_SETTINGS_DEFAULTS.ROTATE),
	IR: yesNo.catch(CAMERA_SETTINGS_DEFAULTS.IR),
	CRUISE: z
		.enum(["no", "presets", "360"])
		.catch(CAMERA_SETTINGS_DEFAULTS.CRUISE),
});

export function parseCameraConf(
	conf: Record<string, string>,
): CameraSettingsDraft {
	return cameraConfSchema.parse(conf);
}

// conf=camera always answers with at least HOMEVER, appended by the script
// itself, so a response is not proof that camera.conf was read.
export function isCameraConfEmpty(conf: Record<string, string>): boolean {
	return CAMERA_SETTING_KEYS.every((key) => conf[key] === undefined);
}

// camera_settings.sh switches on the first two characters of /home/homever,
// which get_configs echoes back as HOMEVER. On 11/12 firmware the generic
// MOTION_DETECTION flag exists and gates the AI detections; anywhere else the
// flag is inert and only human detection is wired up.
export function isFw12Firmware(homever: string | undefined): boolean {
	const major = homever?.slice(0, 2);
	return major === "11" || major === "12";
}

// Parameter order is the stock UI's and it matters: switch_on goes last so
// that when the camera is being switched off every other ipc_cmd has already
// run against a live camera. The query serializer emits keys in insertion
// order, and the script reads at most APPLY_PARAM_SLOTS of them.
export function toApplyQuery(
	draft: CameraSettingsDraft,
): NonNullable<SetCameraSettingsData["query"]> {
	return {
		save_video_on_motion: draft.SAVE_VIDEO_ON_MOTION,
		motion_detection: draft.MOTION_DETECTION,
		sensitivity: draft.SENSITIVITY,
		ai_human_detection: draft.AI_HUMAN_DETECTION,
		ai_vehicle_detection: draft.AI_VEHICLE_DETECTION,
		ai_animal_detection: draft.AI_ANIMAL_DETECTION,
		face_detection: draft.FACE_DETECTION,
		motion_tracking: draft.MOTION_TRACKING,
		sound_detection: draft.SOUND_DETECTION,
		sound_sensitivity: draft.SOUND_SENSITIVITY,
		led: draft.LED,
		ir: draft.IR,
		rotate: draft.ROTATE,
		cruise: draft.CRUISE,
		switch_on: draft.SWITCH_ON,
	};
}

// The full object, not just the changed keys: set_configs rewrites a key only
// when a `^KEY=` line already exists, so sending all fifteen cannot add
// anything and leaves the file in step with what was just applied.
export function toConfBody(draft: CameraSettingsDraft): Record<string, string> {
	return { ...draft };
}

// A floor, not a measurement: the sleeps in camera_settings.sh are known, the
// cost of the ipc_cmd calls between them is not.
export function estimateApplyMs(draft: CameraSettingsDraft): number {
	return (
		APPLY_TICK_MS * APPLY_PARAM_SLOTS +
		(draft.SWITCH_ON === "no" ? APPLY_SWITCH_OFF_EXTRA_MS : 0) +
		(draft.CRUISE === "no" ? 0 : APPLY_CRUISE_EXTRA_MS)
	);
}

export type ChangeSummary = {
	labels: string[];
	switchingOff: boolean;
};

// "Currently changed" is isDefaultValue === false, not isDirty: isDirty is
// sticky and stays true after a value is put back by hand. fieldMeta carries
// mounted fields only, which is what this page wants - a control the firmware
// ignores on this camera is rendered disabled and can never be counted.
export function summarizeChanges(
	fieldMeta: Partial<Record<keyof CameraSettingsDraft, AnyFieldMeta>>,
	values: CameraSettingsDraft,
): ChangeSummary {
	const changed = CAMERA_SETTING_KEYS.filter(
		(key) => fieldMeta[key]?.isDefaultValue === false,
	);
	return {
		labels: changed.map((key) => SETTING_COPY[key].label),
		switchingOff: values.SWITCH_ON === "no" && changed.includes("SWITCH_ON"),
	};
}
