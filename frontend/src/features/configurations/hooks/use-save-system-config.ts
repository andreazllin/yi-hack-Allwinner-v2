import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Options, type SetConfigsData, setConfigs } from "@/api";
import {
	getConfigsQueryKey,
	setConfigsMutation,
} from "@/api/@tanstack/react-query.gen";
import { assertCgiOk, assertSavableConf } from "@/lib/cgi";

type Params = {
	// Both pages write conf=system, so the toast has to say which one saved.
	surface: string;
};

export function useSaveSystemConfig({ surface }: Params) {
	const queryClient = useQueryClient();
	return useMutation({
		// The generated factory fixes the request/variables shape; its
		// mutationFn resolves on any HTTP 200, and set_configs.sh answers 200
		// {"error":"true"} when it rejects the body — so the body is re-checked
		// here, inside mutationFn.
		...setConfigsMutation(),
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
				title: "Configuration saved",
				message: `${surface} written to system.conf. The camera applies it at the next boot.`,
				color: "teal",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Could not save configuration",
				message: `The camera refused the write: ${error.message}`,
				color: "red",
			});
		},
	});
}
