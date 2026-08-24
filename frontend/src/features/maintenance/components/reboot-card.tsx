import {
	Alert,
	Button,
	Card,
	Group,
	Loader,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ArrowClockwise } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";
import { useEffect } from "react";
import { ConfirmModal } from "@/features/maintenance/components/confirm-modal";
import { useRebootCamera } from "@/features/maintenance/hooks/use-reboot-camera";

type Props = {
	// Reported upward so the other cards can lock while this one holds the
	// camera — a reboot during a firmware flash is the dangerous direction.
	onBusyChange: (busy: boolean) => void;
	rebooting: boolean;
	// True while another card holds the camera (e.g. a firmware flash).
	disabled: boolean;
	onRebootStarted: () => void;
};

export const RebootCard: FunctionComponent<Props> = ({
	rebooting,
	onRebootStarted,
	onBusyChange,
	disabled,
}) => {
	const reboot = useRebootCamera();
	const [confirmOpened, confirm] = useDisclosure(false);

	const runReboot = () => {
		confirm.close();
		reboot.mutate(undefined, { onSuccess: onRebootStarted });
	};

	useEffect(() => {
		onBusyChange(reboot.isPending);
	}, [reboot.isPending, onBusyChange]);

	return (
		<Card withBorder>
			<Stack gap="sm">
				<Title order={4}>Reboot</Title>
				{rebooting ? (
					<Alert variant="light" color="blue" icon={<Loader size={18} />}>
						<Stack gap="xs">
							<Text size="sm">
								The camera accepted the reboot and is going down. It is
								unreachable for roughly 60-90 seconds; recording and streaming
								stop for that time.
							</Text>
							<Text size="sm" c="dimmed">
								This page checks once automatically after a minute. Reload it if
								the camera takes longer.
							</Text>
							<Group>
								<Button
									variant="default"
									leftSection={<ArrowClockwise size={16} />}
									onClick={() => window.location.reload()}
								>
									Reload the frontend
								</Button>
							</Group>
						</Stack>
					</Alert>
				) : (
					<>
						<Text size="sm" c="dimmed">
							{disabled
								? "Another maintenance action is running. Rebooting now could interrupt it."
								: "reboot.sh syncs the SD card, stops the MQTT client and restarts the camera."}
						</Text>
						<Group>
							<Button
								color="red"
								leftSection={<ArrowClockwise size={16} />}
								loading={reboot.isPending}
								disabled={disabled}
								onClick={confirm.open}
							>
								Reboot camera
							</Button>
						</Group>
					</>
				)}
			</Stack>
			<ConfirmModal
				opened={confirmOpened}
				title="Reboot the camera?"
				confirmLabel="Reboot"
				loading={reboot.isPending}
				onClose={confirm.close}
				onConfirm={runReboot}
			>
				<Text size="sm">
					The camera stops recording, streaming and answering this frontend for
					about 60-90 seconds. Unsaved settings on other pages are not applied
					by rebooting — save them first.
				</Text>
			</ConfirmModal>
		</Card>
	);
};
