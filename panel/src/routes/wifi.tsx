import {
	Alert,
	Button,
	Card,
	Group,
	Modal,
	PasswordInput,
	Select,
	Skeleton,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MagnifyingGlass, WarningCircle } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { essidsFromScan } from "@/features/wifi/helpers/essids";
import { EMPTY_WIFI_FORM, wifiSchema } from "@/features/wifi/helpers/schema";
import { useCameraStatus } from "@/features/wifi/hooks/use-camera-status";
import { useSaveWifi } from "@/features/wifi/hooks/use-save-wifi";
import { useScanWifi } from "@/features/wifi/hooks/use-scan-wifi";

// Stock help text, verbatim.
const PASSWORD_CHARS =
	"Allowed special chars: \\ | ! \" $ % & / ( ) ' ? ^ [ ] @ < > , ; . : - _";

const WifiPage: FunctionComponent = () => {
	const scan = useScanWifi();
	const save = useSaveWifi();
	const status = useCameraStatus();
	const [confirmOpened, { open: openConfirm, close: closeConfirm }] =
		useDisclosure(false);

	const form = useForm({
		defaultValues: EMPTY_WIFI_FORM,
		validators: { onChange: wifiSchema },
		onSubmit: ({ value }) => {
			save.mutate(value, { onSuccess: () => closeConfirm() });
		},
	});

	const networks = essidsFromScan(scan.data);

	return (
		<Stack gap="md">
			<Title order={2}>WiFi</Title>
			<Alert
				variant="light"
				color="yellow"
				title="Wrong credentials cut the camera off"
				icon={<WarningCircle size={20} />}
			>
				The credentials are written to the camera's flash and used at its next
				reboot; until then it stays on the network it is on now. If they are
				wrong the camera will not rejoin any network and this panel becomes
				unreachable.
			</Alert>
			<Card withBorder>
				<Group justify="space-between" wrap="nowrap" gap="md">
					<Text size="sm" c="dimmed">
						Currently associated network
					</Text>
					{status.isPending ? (
						<Skeleton height={16} width={140} />
					) : (
						<Text size="sm" ff="monospace" ta="right">
							{status.isError
								? "unknown — status.json did not answer"
								: status.data?.wlan_essid || "none (wired or not associated)"}
						</Text>
					)}
				</Group>
			</Card>
			<Card withBorder>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						openConfirm();
					}}
				>
					<Stack gap="md">
						<Title order={4}>WiFi</Title>
						<form.Field name="WIFI_ESSID">
							{(field) => (
								<Stack gap="xs">
									<Group align="flex-end" gap="sm" wrap="nowrap">
										<Select
											flex={1}
											label="Scanned networks"
											placeholder={
												networks.length === 0
													? "Scan to list nearby networks"
													: "Pick a network"
											}
											data={networks}
											disabled={networks.length === 0}
											searchable
											nothingFoundMessage="No match"
											value={
												networks.includes(field.state.value)
													? field.state.value
													: null
											}
											onChange={(value) => {
												if (value !== null) {
													field.handleChange(value);
												}
											}}
										/>
										<Button
											variant="default"
											leftSection={<MagnifyingGlass size={16} />}
											loading={scan.isPending}
											onClick={() => scan.mutate()}
										>
											Scan
										</Button>
									</Group>
									{scan.isSuccess && networks.length === 0 && (
										<Text size="sm">
											The scan found no networks. iwlist only reports what the
											radio can see at that moment — scan again, or type the
											ESSID below.
										</Text>
									)}
									<TextInput
										label="WiFi network ESSID"
										description="Picking a scanned network fills this in; type it yourself for a hidden or out-of-range network."
										value={field.state.value}
										error={field.state.meta.errors[0]?.message}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(event.currentTarget.value)
										}
									/>
								</Stack>
							)}
						</form.Field>
						<form.Field name="WIFI_PASSWORD">
							{(field) => (
								<PasswordInput
									label="Password"
									description={`Password to access the WiFi network. ${PASSWORD_CHARS}`}
									value={field.state.value}
									error={field.state.meta.errors[0]?.message}
									onBlur={field.handleBlur}
									onChange={(event) =>
										field.handleChange(event.currentTarget.value)
									}
								/>
							)}
						</form.Field>
						<form.Field name="WIFI_PASSWORD2">
							{(field) => (
								<PasswordInput
									label="Confirmation password"
									description="Enter the password again — the camera discards the whole save if the two differ."
									value={field.state.value}
									error={field.state.meta.errors[0]?.message}
									onBlur={field.handleBlur}
									onChange={(event) =>
										field.handleChange(event.currentTarget.value)
									}
								/>
							)}
						</form.Field>
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
			</Card>
			<Modal
				opened={confirmOpened}
				onClose={closeConfirm}
				title="Save these WiFi credentials?"
			>
				<Stack gap="md">
					<Text size="sm">
						The camera writes the ESSID and passphrase into its flash partition
						(keeping a backup of that partition on the SD card) and joins the
						new network at its next reboot. If the credentials are wrong it will
						not come back and you will need physical access to recover it.
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

export const Route = createFileRoute("/wifi")({
	component: WifiPage,
});
