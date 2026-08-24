import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { reboot } from "@/api";
import { assertCgiOk } from "@/lib/cgi";

// reboot.sh is a DESTRUCTIVE mutating GET — it answers {"error":"false"} and
// then reboots — so it has no generated mutation; wrap the SDK function.
export function useRebootCamera() {
	return useMutation({
		mutationFn: async () => {
			const response = await reboot({ throwOnError: true });
			return assertCgiOk(response.data);
		},
		onSuccess: () => {
			notifications.show({
				title: "Reboot started",
				message:
					"The camera is going down. It usually answers again in 60-90s.",
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not reboot the camera",
				message: `reboot.sh failed: ${error.message}`,
				color: "red",
			});
		},
	});
}
