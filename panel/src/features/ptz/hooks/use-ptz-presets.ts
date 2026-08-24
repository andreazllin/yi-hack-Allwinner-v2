import { useQuery } from "@tanstack/react-query";
import { getConfigsOptions } from "@/api/@tanstack/react-query.gen";
import { parsePresetSlots } from "@/features/ptz/helpers/presets";
import { assertCgiOk, stripNullKey } from "@/lib/cgi";

// Presets are READ from the config file, never from preset.sh
// (action=get_presets is explicitly refused with message "-99").
export function usePtzPresets() {
	return useQuery({
		...getConfigsOptions({ query: { conf: "ptz_presets" } }),
		select: (data) => parsePresetSlots(stripNullKey(assertCgiOk(data))),
	});
}
