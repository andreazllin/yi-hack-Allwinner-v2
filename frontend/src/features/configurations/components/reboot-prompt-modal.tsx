import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import type { FunctionComponent } from "react";
import { useRebootCamera } from "@/features/configurations/hooks/use-reboot-camera";

type Props = {
	opened: boolean;
	onClose: () => void;
};

// The firmware reads system.conf only at boot, so a saved change does nothing
// until the camera restarts. The stock UI just prints a static notice; this
// offers the reboot, with the consequences spelled out, and lets it wait.
export const RebootPromptModal: FunctionComponent<Props> = ({
	opened,
	onClose,
}) => {
	const rebootCamera = useRebootCamera();

	return (
		<Modal opened={opened} onClose={onClose} title="Reboot to apply?">
			<Stack gap="md">
				<Text size="sm">
					The configuration is written to the SD card, but the firmware only
					reads it while booting. Rebooting now drops the RTSP and ONVIF streams
					and makes the camera unreachable for about a minute.
				</Text>
				<Group justify="flex-end">
					<Button
						variant="default"
						onClick={onClose}
						disabled={rebootCamera.isPending}
					>
						Later
					</Button>
					<Button
						color="red"
						loading={rebootCamera.isPending}
						onClick={() => {
							rebootCamera.mutate(undefined, { onSuccess: onClose });
						}}
					>
						Reboot now
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
