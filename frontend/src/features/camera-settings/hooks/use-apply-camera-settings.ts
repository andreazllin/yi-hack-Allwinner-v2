import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type GetConfigsResponse, setCameraSettings, setConfigs } from "@/api";
import { getConfigsQueryKey } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk } from "@/lib/cgi";
import type { CameraSettingsDraft } from "../constants/camera-settings";
import { toApplyQuery, toConfBody } from "../helpers/camera-settings";

// The half-succeeded save: the camera is running the new settings and
// camera.conf still holds the old ones, so the next reboot silently reverts
// them. This is exactly the state the stock UI leaves the camera in on every
// save, and the reason the second call exists - it has to be reported as
// something other than a plain failure.
export class SettingsNotPersistedError extends Error {
	constructor(cause: unknown) {
		super("The camera applied the settings but did not save them", { cause });
		this.name = "SettingsNotPersistedError";
	}
}

export function useApplyCameraSettings() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (draft: CameraSettingsDraft) => {
			// Two calls, in this order. camera_settings.sh is a mutating GET, so the
			// generator gave it a queryOptions factory and no mutation - the SDK
			// function is called by hand. It applies the settings to the running
			// camera and writes nothing; set_configs then persists them. Applying
			// first means what gets persisted is what actually landed.
			const applied = await setCameraSettings({
				query: toApplyQuery(draft),
				throwOnError: true,
			});
			assertCgiOk(applied.data);

			try {
				const persisted = await setConfigs({
					query: { conf: "camera" },
					body: toConfBody(draft),
					throwOnError: true,
				});
				assertCgiOk(persisted.data);
			} catch (error) {
				throw new SettingsNotPersistedError(error);
			}

			return draft;
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: getConfigsQueryKey({ query: { conf: "camera" } }),
			});
		},
		onSuccess: (_data, draft) => {
			// The write landed, so camera.conf now holds these values: seeding the
			// cache with them stops the form's baseline and the cache disagreeing
			// while the invalidation round trip is in flight. That refetch is still
			// worth making - set_configs reports success for a key whose line is
			// absent from the file and writes nothing. On the failure paths this is
			// skipped and the edits stay marked unsaved, which is the truth.
			queryClient.setQueryData<GetConfigsResponse>(
				getConfigsQueryKey({ query: { conf: "camera" } }),
				(previous) =>
					previous ? { ...previous, ...toConfBody(draft) } : previous,
			);
			notifications.show({
				title: "Camera settings applied",
				message:
					"The camera is running the new settings and camera.conf was updated, so they survive a reboot.",
				color: "teal",
			});
		},
		onError: (error) => {
			if (error instanceof SettingsNotPersistedError) {
				notifications.show({
					title: "Applied, but not saved",
					message:
						"The camera is running the new settings, but camera.conf could not be written - they will revert on the next reboot. Apply again to retry the save.",
					color: "red",
					autoClose: false,
				});
				return;
			}
			notifications.show({
				title: "Could not apply camera settings",
				message: `The camera did not confirm the change: ${error.message}. Some settings may already be live, and nothing was written to camera.conf.`,
				color: "red",
			});
		},
	});
}
