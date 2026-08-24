import type { CameraConf, SetCameraSettingsData, YesNo } from "@/api";

type ApplyQuery = NonNullable<SetCameraSettingsData["query"]>;

// Derived from the generated query type so the unions stay tied to the spec's
// enums instead of being restated here. camera_settings.sh compares values
// with literal string tests and has no else branch: an out-of-domain value is
// dropped without running a command while the call still reports success, so
// the UI must never be able to produce one.
export type Sensitivity = NonNullable<ApplyQuery["sensitivity"]>;
export type SoundSensitivity = NonNullable<ApplyQuery["sound_sensitivity"]>;
export type Cruise = NonNullable<ApplyQuery["cruise"]>;

// What the form edits. The generated CameraConf is lossier than the real
// contract twice over: every key is optional (get_configs returns whatever the
// file happens to hold) and the three enums arrive as plain string. HOMEVER is
// left out on purpose - get_configs appends it from /home/homever, it is not a
// camera.conf key, and set_configs would accept it and write nothing.
export type CameraSettingsDraft = Required<
	Omit<CameraConf, "SENSITIVITY" | "SOUND_SENSITIVITY" | "CRUISE" | "HOMEVER">
> & {
	SENSITIVITY: Sensitivity;
	SOUND_SENSITIVITY: SoundSensitivity;
	CRUISE: Cruise;
};

// Every key the firmware treats as on/off, which is all of them bar the three
// enums above.
export type YesNoKey = {
	[K in keyof CameraSettingsDraft]: CameraSettingsDraft[K] extends YesNo
		? K
		: never;
}[keyof CameraSettingsDraft];

// Fallbacks for a key that camera.conf does not hold, or holds with a value
// outside the firmware's domain. Taken from the shipped template
// (src/static/static/yi-hack/etc/camera.conf), which is what a factory reset
// puts back.
export const CAMERA_SETTINGS_DEFAULTS: CameraSettingsDraft = {
	SWITCH_ON: "yes",
	SAVE_VIDEO_ON_MOTION: "yes",
	MOTION_DETECTION: "no",
	SENSITIVITY: "low",
	AI_HUMAN_DETECTION: "no",
	AI_VEHICLE_DETECTION: "no",
	AI_ANIMAL_DETECTION: "no",
	FACE_DETECTION: "no",
	MOTION_TRACKING: "no",
	SOUND_DETECTION: "no",
	SOUND_SENSITIVITY: "80",
	LED: "no",
	ROTATE: "no",
	IR: "yes",
	CRUISE: "no",
};

export type SettingCopy = {
	label: string;
	description?: string;
};

// Labels and descriptions are the stock page's, verbatim
// (src/www/httpd/htdocs/pages/camera_settings.html) - one exception, noted
// below. The three selects carry no description there either.
export const SETTING_COPY: Record<keyof CameraSettingsDraft, SettingCopy> = {
	SWITCH_ON: {
		label: "Switch on/off the camera",
		description: "Switch on/off the video on the camera.",
	},
	SAVE_VIDEO_ON_MOTION: {
		label: "Save video when a motion is detected",
		description:
			"If enabled, video will be saved only when a motion is detected. If disabled, video will be always saved. (It takes effect only if recording is enabled)",
	},
	MOTION_DETECTION: {
		label: "Motion Detection",
		description:
			"Enable/disable generic Motion Detection (if you select this option, all AI detections will be disabled).",
	},
	SENSITIVITY: { label: "Detection sensitivity" },
	AI_HUMAN_DETECTION: {
		label: "AI Human Detection",
		description: "Enable/disable AI Human Detection (requires plan).",
	},
	AI_VEHICLE_DETECTION: {
		label: "AI Vehicle Detection",
		// The stock string reads "AI Vehicle Human Detection"; the stray "Human"
		// is a typo in the firmware's HTML, not a different feature.
		description: "Enable/disable AI Vehicle Detection (requires plan).",
	},
	AI_ANIMAL_DETECTION: {
		label: "AI Animal Detection",
		description: "Enable/disable AI Animal Detection (requires plan).",
	},
	FACE_DETECTION: {
		label: "Face Detection",
		description: "Enable/disable Face Detection (if your cam supports it).",
	},
	MOTION_TRACKING: {
		label: "Motion Tracking sensor",
		description:
			"Enable/disable Motion Tracking sensor (if your cam supports it).",
	},
	SOUND_DETECTION: {
		label: "Sound Detection",
		description: "Enable/disable sound detection.",
	},
	SOUND_SENSITIVITY: { label: "Sound detection sensitivity" },
	LED: { label: "Status led", description: "Set status led on or off." },
	IR: { label: "IR led", description: "Enable IR led for night vision." },
	ROTATE: {
		label: "Rotate",
		description: "Enable image rotation for ceiling mount.",
	},
	CRUISE: { label: "Cruise mode" },
};

// SETTING_COPY is typed as a total Record, so this cannot fall out of step
// with the draft shape the way a second hand-written list would.
export const CAMERA_SETTING_KEYS = Object.keys(
	SETTING_COPY,
) as (keyof CameraSettingsDraft)[];

export const SENSITIVITY_OPTIONS: readonly {
	value: Sensitivity;
	label: string;
}[] = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
];

// Exactly the nine values the script compares against: 55/65/75/85 look
// plausible and are silently dropped.
export const SOUND_SENSITIVITY_OPTIONS: readonly {
	value: SoundSensitivity;
	label: string;
}[] = [
	{ value: "30", label: "30" },
	{ value: "35", label: "35" },
	{ value: "40", label: "40" },
	{ value: "45", label: "45" },
	{ value: "50", label: "50" },
	{ value: "60", label: "60" },
	{ value: "70", label: "70" },
	{ value: "80", label: "80" },
	{ value: "90", label: "90" },
];

export const CRUISE_OPTIONS: readonly { value: Cruise; label: string }[] = [
	{ value: "no", label: "Off" },
	{ value: "presets", label: "Presets" },
	{ value: "360", label: "360" },
];

// Cost of a save, read off the sleeps in camera_settings.sh. The loop runs a
// fixed 15 iterations and sleeps 0.5s on every one of them whether or not the
// parameter was recognised, so the floor does not shrink by sending less.
export const APPLY_TICK_MS = 500;
export const APPLY_PARAM_SLOTS = 15;
// switch_on=no adds `sleep 1`; cruise=presets|360 adds `sleep 0.5`.
export const APPLY_SWITCH_OFF_EXTRA_MS = 1000;
export const APPLY_CRUISE_EXTRA_MS = 500;
