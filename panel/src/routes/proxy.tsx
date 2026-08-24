import {
	Button,
	Card,
	Group,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { type FunctionComponent, useEffect } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { ProxyTestCard } from "@/features/proxy/components/proxy-test-card";
import { useProxychainsConfig } from "@/features/proxy/hooks/use-proxychains-config";
import { useSaveProxychains } from "@/features/proxy/hooks/use-save-proxychains";
import { useTestProxy } from "@/features/proxy/hooks/use-test-proxy";

const ProxyPage: FunctionComponent = () => {
	const { data, isPending, isError, refetch } = useProxychainsConfig();
	const save = useSaveProxychains();
	const directTest = useTestProxy("0");
	const proxiedTest = useTestProxy("1");

	const form = useForm({
		defaultValues: { PROXYCHAINS_SERVERS: "" },
		onSubmit: ({ value }) => {
			if (!data) {
				return;
			}
			save.mutate({
				query: { conf: "proxychains" },
				body: { ...data, ...value },
			});
		},
	});

	useEffect(() => {
		if (data) {
			form.reset({ PROXYCHAINS_SERVERS: data.PROXYCHAINS_SERVERS ?? "" });
		}
	}, [data, form]);

	if (isError) {
		return (
			<Stack gap="md">
				<Title order={2}>Proxy</Title>
				<ErrorState
					title="Could not load the proxy configuration"
					description="The camera did not return etc/proxychains.conf. Check that it is reachable (and CAM_HOST in dev)."
					onRetry={() => refetch()}
				/>
			</Stack>
		);
	}

	return (
		<Stack gap="md">
			<Title order={2}>Proxy</Title>
			<Card withBorder>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						void form.handleSubmit();
					}}
				>
					<Stack gap="md">
						<div>
							<Title order={4}>proxychains</Title>
							<Text size="sm" c="dimmed">
								Saving rebuilds proxychains.conf from its template and takes
								effect after the camera reboots.
							</Text>
						</div>
						{isPending ? (
							<Stack gap={6}>
								<Skeleton height={14} width={110} />
								<Skeleton height={36} />
							</Stack>
						) : (
							<>
								{Object.keys(data).length === 0 && (
									<Text size="sm">
										The camera has no etc/proxychains.conf to read, so there is
										nothing configured yet. Saving a server list recreates the
										file from its template.
									</Text>
								)}
								<form.Field name="PROXYCHAINS_SERVERS">
									{(field) => (
										<TextInput
											label="Server list"
											description={
												'List of proxy servers, semicolon separated. e.g. "socks4 1.2.3.4 4080;socks4 5.6.7.8 8080"'
											}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.currentTarget.value)
											}
										/>
									)}
								</form.Field>
							</>
						)}
						<form.Subscribe selector={(state) => state.isDefaultValue}>
							{(isDefaultValue) => (
								<Group justify="flex-end">
									<Button
										type="submit"
										loading={save.isPending}
										disabled={isPending || isDefaultValue}
									>
										Save Configuration
									</Button>
								</Group>
							)}
						</form.Subscribe>
					</Stack>
				</form>
			</Card>
			<Stack gap="xs">
				<Title order={4}>Connectivity test</Title>
				<Text size="sm" c="dimmed">
					Each test makes the camera fetch http://ipinfo.io and shows what came
					back, so it reveals the camera's public address to an external
					service. Nothing runs until you press a button.
				</Text>
			</Stack>
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
				<ProxyTestCard
					title="Test without proxy"
					description="Direct wget from the camera, ignoring the proxy list."
					pending={directTest.isPending}
					isError={directTest.isError}
					result={directTest.data}
					onTest={() => directTest.mutate()}
				/>
				<ProxyTestCard
					title="Test through proxy"
					description="wget wrapped in proxychains4, using the saved server list."
					pending={proxiedTest.isPending}
					isError={proxiedTest.isError}
					result={proxiedTest.data}
					onTest={() => proxiedTest.mutate()}
				/>
			</SimpleGrid>
		</Stack>
	);
};

export const Route = createFileRoute("/proxy")({
	component: ProxyPage,
});
