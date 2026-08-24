import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loadConfigMutation } from "@/api/@tanstack/react-query.gen";
import { parseRestoreResult } from "@/features/maintenance/helpers/restore";

export function useRestoreConfig() {
	const queryClient = useQueryClient();
	return useMutation({
		...loadConfigMutation(),
		onSettled: () => {
			// The uploaded archive replaces every .conf, so every cached response is
			// wrong. Only mounted queries refetch (default refetchType "active").
			queryClient.invalidateQueries();
		},
		onSuccess: (data) => {
			const result = parseRestoreResult(data);
			notifications.show({
				title: result.ok ? "Configuration restored" : "Restore failed",
				message: result.message,
				color: result.ok ? "teal" : "red",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not upload the archive",
				message: `load.sh failed: ${error.message}`,
				color: "red",
			});
		},
	});
}
