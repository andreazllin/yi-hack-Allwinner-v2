import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Options, type SetConfigsData, setConfigs } from "@/api";
import {
	getConfigsQueryKey,
	setConfigsMutation,
} from "@/api/@tanstack/react-query.gen";
import { assertCgiOk, assertSavableConf } from "@/lib/cgi";

export function useSaveStaticIp() {
	const queryClient = useQueryClient();
	return useMutation({
		...setConfigsMutation(),
		// The generated mutationFn resolves on {"error":"true"} — every CGI
		// failure is an HTTP 200 — so it is replaced by a guarded call that
		// puts logical failures in the mutation's error state.
		mutationFn: async (variables: Options<SetConfigsData>) => {
			assertSavableConf(variables.body);
			const response = await setConfigs({ ...variables, throwOnError: true });
			return assertCgiOk(response.data);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: getConfigsQueryKey({ query: { conf: "system" } }),
			});
		},
		onSuccess: () => {
			notifications.show({
				title: "Network address saved",
				message: "The camera picks it up on its next reboot.",
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not save the network address",
				message: `The camera refused the write: ${error.message}`,
				color: "red",
			});
		},
	});
}
