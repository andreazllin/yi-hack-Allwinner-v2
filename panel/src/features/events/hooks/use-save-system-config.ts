import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setConfigs } from "@/api";
import { getConfigsQueryKey } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk } from "@/lib/cgi";

// setConfigsMutation() contributes nothing but a mutationFn, and that one
// resolves on logical failures too (HTTP 200 + {"error":"true"}), so the SDK is
// called here directly with the response going through assertCgiOk.
export function useSaveSystemConfig() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (config: Record<string, string>) => {
			const response = await setConfigs({
				query: { conf: "system" },
				// The full config goes back, not just the edited keys: set_configs.sh
				// rewrites one `sed` line per key and ignores keys that are absent
				// from the file, so the untouched ones are a no-op. HOSTNAME is the
				// one key with a side effect — it re-runs `hostname` with the value
				// the camera already has.
				body: config,
				throwOnError: true,
			});
			return assertCgiOk(response.data);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: getConfigsQueryKey({ query: { conf: "system" } }),
			});
		},
		onSuccess: () => {
			notifications.show({
				title: "Recording settings saved",
				message:
					"Auto-clean, events time and FTP upload take effect after the camera reboots.",
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not save recording settings",
				message: `system.conf was not written: ${error.message}`,
				color: "red",
			});
		},
	});
}
