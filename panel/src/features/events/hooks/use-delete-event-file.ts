import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEventFile } from "@/api";
import { getEventFilesQueryKey } from "@/api/@tanstack/react-query.gen";
import {
	isEventDirName,
	isEventFileName,
} from "@/features/events/helpers/event-paths";
import { assertCgiOk } from "@/lib/cgi";

type Variables = {
	dir: string;
	filename: string;
};

// eventsfiledel.sh is a MUTATING GET — wrapped by hand, like the directory
// delete.
//
// The `/` between dirname and filename MUST reach the camera unescaped, so the
// query serializer's escaping is disabled for this call. Percent-encoding it as
// %2F breaks the delete twice over: `%` is in validateQueryString's blocklist,
// so the script answers {"error":"true"} and deletes nothing; and even past that
// gate the literal "%2F" would make `rm -f` target a path that does not exist,
// which `rm -f` reports as success. Every delete failed silently before this.
//
// allowReserved turns escaping off for the whole value, and the script
// interpolates it unquoted into `rm -f` as root, so both halves are validated
// here first. The firmware's own validateRecFile is not a safety net worth
// relying on — it only checks length and a few marker offsets.
export function useDeleteEventFile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ dir, filename }: Variables) => {
			if (!isEventDirName(dir) || !isEventFileName(filename)) {
				throw new Error(
					"Refusing to delete: the name is not one the camera could have produced.",
				);
			}
			const response = await deleteEventFile({
				query: { file: `${dir}/${filename}` },
				querySerializer: { allowReserved: true },
				throwOnError: true,
			});
			return assertCgiOk(response.data);
		},
		onSettled: (_data, _error, { dir }) => {
			queryClient.invalidateQueries({
				queryKey: getEventFilesQueryKey({ query: { dirname: dir } }),
			});
		},
		onSuccess: (_data, { filename }) => {
			notifications.show({
				title: "Recording deleted",
				message: `${filename} and its thumbnail were removed from the SD card.`,
				color: "teal",
			});
		},
		onError: (error, { filename }) => {
			notifications.show({
				title: "Could not delete recording",
				message: `${filename} was not deleted: ${error.message}`,
				color: "red",
			});
		},
	});
}
