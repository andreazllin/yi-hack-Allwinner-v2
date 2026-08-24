import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { timelapse } from "@/api";
import { timelapseQueryKey } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk } from "@/lib/cgi";

// timelapse.sh?action=delete is a MUTATING GET — the generator only emits a
// queryOptions factory for it, so wrap the SDK function manually.
export function useDeleteTimelapse() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (file: string) => {
			const response = await timelapse({
				query: { action: "delete", file },
				throwOnError: true,
			});
			return assertCgiOk(response.data);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: timelapseQueryKey({ query: { action: "list" } }),
			});
		},
		onSuccess: (_data, file) => {
			notifications.show({
				title: "Video deleted",
				message: `${file} was removed from the SD card.`,
				color: "teal",
			});
		},
		onError: (error, file) => {
			notifications.show({
				title: "Could not delete video",
				message: `The camera refused to delete ${file}: ${error.message}`,
				color: "red",
			});
		},
	});
}
