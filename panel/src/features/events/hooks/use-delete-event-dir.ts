import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEventDir } from "@/api";
import { getEventDirsQueryKey } from "@/api/@tanstack/react-query.gen";
import { isEventDirName } from "@/features/events/helpers/event-paths";
import { assertCgiOk } from "@/lib/cgi";

// eventsdirdel.sh is a MUTATING GET — the generator only emits a queryOptions
// factory for it, so the SDK function is wrapped in a mutation by hand.
export function useDeleteEventDir() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (dir: string) => {
			// The firmware validates nothing here: refuse before the value can
			// reach `rm -rf /tmp/sd/record/$DIR` (unquoted, as root).
			if (!isEventDirName(dir)) {
				throw new Error(`"${dir}" is not an event directory name`);
			}
			const response = await deleteEventDir({
				query: { dir },
				throwOnError: true,
			});
			// The response is {"error":"false"} even when nothing was deleted, so
			// the refetch below — not this body — is what proves the directory is
			// gone.
			return assertCgiOk(response.data);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: getEventDirsQueryKey() });
		},
		onSuccess: (_data, dir) => {
			notifications.show({
				title: "Directory deleted",
				message: `${dir} and the recordings inside it were removed from the SD card.`,
				color: "teal",
			});
		},
		onError: (error, dir) => {
			notifications.show({
				title: "Could not delete directory",
				message: `${dir} was not deleted: ${error.message}`,
				color: "red",
			});
		},
	});
}
