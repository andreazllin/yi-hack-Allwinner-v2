import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { reboot } from "@/api";
import { assertCgiOk } from "@/lib/cgi";

// reboot.sh is a MUTATING GET — the generator only emits a queryOptions
// factory for it, so wrap the SDK function manually. No cache work on
// purpose: the camera is going down, and invalidating would fire fresh
// requests at a rebooting httpd.
export function useRebootCamera() {
	return useMutation({
		mutationFn: async () => {
			const response = await reboot({ throwOnError: true });
			return assertCgiOk(response.data);
		},
		onSuccess: () => {
			notifications.show({
				title: "Reboot requested",
				message:
					"The camera is restarting and will be unreachable for about a minute.",
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not reboot",
				message: `The camera refused the reboot request: ${error.message}`,
				color: "red",
			});
		},
	});
}
