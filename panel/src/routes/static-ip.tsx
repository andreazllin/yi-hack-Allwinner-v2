import {
	Alert,
	Button,
	Card,
	Group,
	Modal,
	Skeleton,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { WarningCircle } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { type FunctionComponent, useEffect } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import {
	EMPTY_STATIC_IP,
	pickStaticIp,
	type StaticIpForm,
	staticIpSchema,
} from "@/features/static-ip/helpers/schema";
import { useSaveStaticIp } from "@/features/static-ip/hooks/use-save-static-ip";
import { useSystemConfig } from "@/features/static-ip/hooks/use-system-config";

type FieldSpec = {
	name: keyof StaticIpForm;
	label: string;
	description: string;
};

// Labels and help text are the stock page's, verbatim.
const FIELDS: readonly FieldSpec[] = [
	{
		name: "STATIC_IP",
		label: "IP address",
		description: "Enter your IP address.",
	},
	{
		name: "STATIC_MASK",
		label: "Subnet mask",
		description: "Enter the subnet mask.",
	},
	{
		name: "STATIC_GW",
		label: "Gateway",
		description: "Enter the IP address of your gateway or leave blank.",
	},
	{
		name: "STATIC_DNS1",
		label: "DNS 1",
		description: "Enter the IP address of your DNS server.",
	},
	{
		name: "STATIC_DNS2",
		label: "DNS 2",
		description: "Enter the IP address of your DNS server.",
	},
];

const StaticIpPage: FunctionComponent = () => {
	const { data, isPending, isError, refetch } = useSystemConfig();
	const save = useSaveStaticIp();
	const [confirmOpened, { open: openConfirm, close: closeConfirm }] =
		useDisclosure(false);

	const form = useForm({
		defaultValues: EMPTY_STATIC_IP,
		validators: { onChange: staticIpSchema },
		onSubmit: ({ value }) => {
			if (!data) {
				return;
			}
			save.mutate(
				{ query: { conf: "system" }, body: { ...data, ...value } },
				{ onSuccess: () => closeConfirm() },
			);
		},
	});

	useEffect(() => {
		if (data) {
			form.reset(pickStaticIp(data));
		}
	}, [data, form]);

	if (isError) {
		return (
			<Stack gap="md">
				<Title order={2}>Static IP</Title>
				<ErrorState
					title="Could not load the network configuration"
					description="The camera did not return its system config. Check that it is reachable (and CAM_HOST in dev)."
					onRetry={() => refetch()}
				/>
			</Stack>
		);
	}

	return (
		<Stack gap="md">
			<Title order={2}>Static IP</Title>
			<Alert
				variant="light"
				color="yellow"
				title="A wrong address locks you out"
				icon={<WarningCircle size={20} />}
			>
				The camera applies these values on its next reboot. If the address is
				not reachable on your network you will no longer be able to open this
				panel, and the settings can only be undone over SSH or by resetting the
				camera.
			</Alert>
			<Card withBorder>
				<Stack gap="md">
					<div>
						<Title order={4}>Static IP</Title>
						<Text size="sm" c="dimmed">
							Leave both IP address and subnet mask blank to use DHCP.
						</Text>
					</div>
					{isPending ? (
						<Stack gap="md">
							{FIELDS.map((field) => (
								<Stack key={field.name} gap={6}>
									<Skeleton height={14} width={110} />
									<Skeleton height={36} />
								</Stack>
							))}
						</Stack>
					) : Object.keys(data).length === 0 ? (
						<Text size="sm">
							The camera returned an empty system configuration, so there is
							nothing to edit here. That happens when etc/system.conf is missing
							on the SD card.
						</Text>
					) : (
						<form
							onSubmit={(event) => {
								event.preventDefault();
								openConfirm();
							}}
						>
							<Stack gap="md">
								{FIELDS.map((spec) => (
									<form.Field key={spec.name} name={spec.name}>
										{(field) => (
											<TextInput
												label={spec.label}
												description={spec.description}
												value={field.state.value}
												error={field.state.meta.errors[0]?.message}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.currentTarget.value)
												}
											/>
										)}
									</form.Field>
								))}
								<form.Subscribe
									selector={(state) => ({
										canSubmit: state.canSubmit,
										isDefaultValue: state.isDefaultValue,
									})}
								>
									{({ canSubmit, isDefaultValue }) => (
										<Group justify="flex-end">
											<Button
												type="submit"
												loading={save.isPending}
												disabled={!canSubmit || isDefaultValue}
											>
												Save Configuration
											</Button>
										</Group>
									)}
								</form.Subscribe>
							</Stack>
						</form>
					)}
				</Stack>
			</Card>
			<Modal
				opened={confirmOpened}
				onClose={closeConfirm}
				title="Save the network address?"
			>
				<Stack gap="md">
					<Text size="sm">
						The values are written to the camera's system config now and take
						effect at its next reboot. If they are wrong the camera will not
						come back on your network and this panel will be unreachable.
					</Text>
					<Group justify="flex-end">
						<Button variant="default" onClick={closeConfirm}>
							Cancel
						</Button>
						<Button
							color="red"
							loading={save.isPending}
							onClick={() => {
								void form.handleSubmit();
							}}
						>
							Save
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Stack>
	);
};

export const Route = createFileRoute("/static-ip")({
	component: StaticIpPage,
});
