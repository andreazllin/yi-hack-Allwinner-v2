import {
	Alert,
	Button,
	Card,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DownloadSimple, Warning } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { ConfirmModal } from "@/features/maintenance/components/confirm-modal";
import { useFirmwareInfo } from "@/features/maintenance/hooks/use-firmware-info";
import { useUpgradeFirmware } from "@/features/maintenance/hooks/use-upgrade-firmware";

type Props = {
	disabled: boolean;
};

export const FirmwareCard: FunctionComponent<Props> = ({ disabled }) => {
	const { data, isPending, isError, refetch } = useFirmwareInfo();
	const upgrade = useUpgradeFirmware();
	const [confirmOpened, confirm] = useDisclosure(false);

	// local_fw is the one place this API emits a bare JSON boolean instead of a
	// "yes"/"no" string; latest_fw is "" when the camera's live call to the
	// GitHub API failed, which is indistinguishable from "no release found".
	const hasLocalFirmware = data?.local_fw === true;
	const latest = data?.latest_fw ?? "";
	const available = hasLocalFirmware
		? "Local firmware image on the SD card"
		: latest || null;
	const upgradable =
		hasLocalFirmware || (latest !== "" && latest !== data?.fw_version);

	const runUpgrade = () => {
		confirm.close();
		upgrade.mutate();
	};

	return (
		<Card withBorder>
			<Stack gap="sm">
				<Title order={4}>Firmware</Title>
				{isError ? (
					<ErrorState
						title="Could not read the firmware version"
						description="fw_upgrade.sh?get=info did not answer. It also queries GitHub from the camera, so this fails when the camera has no internet access."
						onRetry={() => refetch()}
					/>
				) : (
					<>
						<Group justify="space-between">
							<Text size="sm" c="dimmed">
								Installed
							</Text>
							{isPending ? (
								<Skeleton height={16} width={120} />
							) : (
								<Text size="sm" ff="monospace">
									{data.fw_version ?? "—"}
								</Text>
							)}
						</Group>
						<Group justify="space-between">
							<Text size="sm" c="dimmed">
								Available
							</Text>
							{isPending ? (
								<Skeleton height={16} width={120} />
							) : (
								<Text size="sm" ff="monospace">
									{available ?? "—"}
								</Text>
							)}
						</Group>
						{!isPending && !upgradable && (
							<Text size="sm" c="dimmed">
								{latest === ""
									? "The camera could not reach the GitHub API, so no online upgrade is offered. A firmware image on the SD card would also appear here."
									: "This camera already runs the latest published release."}
							</Text>
						)}
						{upgrade.isSuccess && (
							<Alert
								variant="light"
								color="orange"
								icon={<Warning size={20} />}
								title="Upgrade requested"
							>
								<Stack gap="xs">
									<Text size="sm" ff="monospace">
										{upgrade.data || "(the camera returned no message)"}
									</Text>
									<Text size="sm">
										If that message says the download completed, the camera is
										flashing now and will reboot on its own. Do not power it off
										and do not reload this page until it answers again.
										fw_upgrade.sh reports refusals ("No SD detected.", "No new
										firmware available.") with the same 200 response, so read
										the message above before waiting.
									</Text>
								</Stack>
							</Alert>
						)}
						<Group>
							<Button
								color="red"
								leftSection={<DownloadSimple size={16} />}
								loading={upgrade.isPending}
								disabled={disabled || isPending || !upgradable}
								onClick={confirm.open}
							>
								Upgrade firmware
							</Button>
						</Group>
					</>
				)}
			</Stack>
			<ConfirmModal
				opened={confirmOpened}
				title="Flash new firmware?"
				confirmLabel="Flash firmware"
				loading={upgrade.isPending}
				onClose={confirm.close}
				onConfirm={runUpgrade}
			>
				<Text size="sm">
					The camera downloads the image and writes it to flash, then reboots
					itself. <strong>Do not cut power</strong> until it is back — an
					interrupted write can leave the camera unbootable, and flashing over
					WiFi is the riskiest way to do it. Use a cable if you can.
				</Text>
				<Text size="sm">
					fw_upgrade.sh also deletes its four staging paths under /tmp/sd before
					it checks whether the download can succeed, so even a failed attempt
					leaves the SD card changed.
				</Text>
			</ConfirmModal>
		</Card>
	);
};
