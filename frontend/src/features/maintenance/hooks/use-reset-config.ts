import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetConfig } from "@/api";
import { assertCgiOk } from "@/lib/cgi";

// reset.sh is a DESTRUCTIVE mutating GET (no generated mutation): it deletes
// hostname and the camera/mqttv4/proxychains/system conf files, extracts
// defaults.tar.bz2, and reports success even if those steps failed.
export function useResetConfig() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const response = await resetConfig({ throwOnError: true });
			return assertCgiOk(response.data);
		},
		onSettled: () => {
			// Every .conf on the camera was just replaced, so every cached response
			// is wrong. Only mounted queries refetch (invalidate's default
			// refetchType is "active") — this page reads no config.
			queryClient.invalidateQueries();
		},
		onSuccess: () => {
			notifications.show({
				title: "Configuration reset",
				message: "yi-hack defaults restored. Reboot the camera to apply them.",
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not reset the configuration",
				message: `reset.sh failed: ${error.message}`,
				color: "red",
			});
		},
	});
}
