import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEventFile } from "@/api";
import { getEventFilesQueryKey } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk } from "@/lib/cgi";

type Variables = {
	dir: string;
	filename: string;
};

// eventsfiledel.sh is a MUTATING GET — wrapped by hand, like the directory
// delete. Unlike `dir`, its `file` parameter IS validated by the firmware
// (validateRecFile: 27 or 29 chars with Y/M/D/H/M/S markers at fixed offsets),
// so a rejected path comes back as {"error":"true"} and assertCgiOk surfaces
// it; there is no second copy of that check here.
export function useDeleteEventFile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ dir, filename }: Variables) => {
			const response = await deleteEventFile({
				query: { file: `${dir}/${filename}` },
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
