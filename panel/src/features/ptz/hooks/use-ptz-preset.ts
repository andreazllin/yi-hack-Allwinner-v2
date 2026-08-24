import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type PtzPresetData, ptzPreset } from "@/api";
import { getConfigsQueryKey } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk } from "@/lib/cgi";

type PresetQuery = PtzPresetData["query"];
type PresetAction = PresetQuery["action"];

// preset.sh is a MUTATING GET, so the generator emits only a queryOptions
// factory for it — the SDK function has to be wrapped by hand. One hook
// covers the endpoint's four actions; the copy is picked per action.
export function usePtzPreset() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (query: PresetQuery) => {
			const response = await ptzPreset({ query, throwOnError: true });
			const data = response.data;
			// preset.sh word-splits a multi-word backend message across its printf
			// format cycles, so failures like "Preset number out of range" arrive
			// as malformed JSON. axios then hands over the raw text instead of an
			// object, and an error check on it would silently pass.
			if (typeof data !== "object") {
				throw new Error(
					"The camera returned a malformed reply, which it only does when the backend rejected the request",
				);
			}
			if (data.error === "true" && data.message) {
				// Carries the real reason: "Wrong arguments", "Invalid query",
				// "-99", or the first word of the backend's own message.
				throw new Error(data.message);
			}
			return assertCgiOk(data);
		},
		onSettled: (_data, _error, query) => {
			// go_preset only moves the lens; the other three actions rewrite
			// ptz_presets.conf, so only they need the config re-read.
			if (query.action === "go_preset") {
				return;
			}
			queryClient.invalidateQueries({
				queryKey: getConfigsQueryKey({ query: { conf: "ptz_presets" } }),
			});
		},
		onSuccess: (_data, query) => {
			notifications.show({
				title: SUCCESS_TITLES[query.action],
				message: describeSuccess(query),
				color: "teal",
			});
		},
		onError: (error, query) => {
			notifications.show({
				title: FAILURE_TITLES[query.action],
				message: error.message,
				color: "red",
			});
		},
	});
}

const SUCCESS_TITLES: Record<PresetAction, string> = {
	go_preset: "Moving to preset",
	add_preset: "Preset added",
	del_preset: "Preset deleted",
	set_home_position: "Home position set",
};

const FAILURE_TITLES: Record<PresetAction, string> = {
	go_preset: "Could not go to the preset",
	add_preset: "Could not add the preset",
	del_preset: "Could not delete the preset",
	set_home_position: "Could not set the home position",
};

function describeSuccess(query: PresetQuery): string {
	switch (query.action) {
		case "go_preset":
			return `The lens is moving to preset ${query.num}.`;
		case "add_preset":
			return `"${query.name}" now holds the current lens position.`;
		case "del_preset":
			return query.num === "all"
				? "Every preset slot was cleared."
				: `Preset ${query.num} was removed.`;
		case "set_home_position":
			return "The current position is the new home position.";
	}
}
