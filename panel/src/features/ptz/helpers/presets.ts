import type { PtzPresetsConf } from "@/api";

export type PtzPresetSlot = {
	num: string;
	// null marks a free slot: the conf file always lists every slot, with an
	// empty value for the unused ones.
	name: string | null;
};

// A slot that actually holds a position.
export type StoredPreset = PtzPresetSlot & { name: string };

// ptz_presets.sh stores "<name>,<x>,<y>" per slot; the stock UI shows the
// first comma-separated field as the name, so keep reading it that way.
export function parsePresetSlots(conf: PtzPresetsConf): PtzPresetSlot[] {
	return Object.entries(conf)
		.map(([num, value]) => ({ num, name: value.split(",")[0] || null }))
		.sort((left, right) => Number(left.num) - Number(right.num));
}

// preset.sh runs `name` through validateString (which rejects ' ! " @ # $ % &
// ^ * ( ) . , : ;) and ptz_presets.sh then writes it into the conf file
// through an unquoted `eval`, so a space or an `=` corrupts the file. Only
// this charset survives both.
export const PRESET_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;
