import { Alert, Button, Card, Group, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { WarningCircle } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";
import { ApplyProgress } from "./apply-progress";

type Props = {
	changedLabels: string[];
	switchingOff: boolean;
	applying: boolean;
	estimatedMs: number;
	onApply: () => void;
	onDiscard: () => void;
};

export const ApplyBar: FunctionComponent<Props> = ({
	changedLabels,
	switchingOff,
	applying,
	estimatedMs,
	onApply,
	onDiscard,
}) => {
	const [confirmOpened, { open: openConfirm, close: closeConfirm }] =
		useDisclosure(false);

	if (changedLabels.length === 0 && !applying) {
		return null;
	}

	const estimatedSeconds = Math.round(estimatedMs / 1000);

	const handleConfirm = () => {
		closeConfirm();
		onApply();
	};

	return (
		<Card
			withBorder
			shadow="sm"
			pos="sticky"
			// Sits just under the AppShell's fixed header; the height comes from the
			// shell's own CSS variable so the layout stays the only place it is set.
			top="calc(var(--app-shell-header-height, 0px) + var(--mantine-spacing-md))"
			style={{ zIndex: 1 }}
		>
			{applying ? (
				<ApplyProgress estimatedMs={estimatedMs} />
			) : (
				<Group justify="space-between" wrap="nowrap" gap="md">
					<Stack gap={0}>
						<Text fw={500}>
							{changedLabels.length === 1
								? "1 setting changed"
								: `${changedLabels.length} settings changed`}
						</Text>
						<Text size="sm" c="dimmed">
							{changedLabels.join(", ")}
						</Text>
					</Stack>
					<Group gap="xs" wrap="nowrap">
						<Button variant="default" onClick={onDiscard}>
							Discard
						</Button>
						<Button onClick={openConfirm}>Apply to camera</Button>
					</Group>
				</Group>
			)}

			<Modal
				opened={confirmOpened}
				onClose={closeConfirm}
				title="Apply camera settings"
				centered
			>
				<Stack gap="sm">
					<Text size="sm">
						These settings will change: {changedLabels.join(", ")}.
					</Text>
					<Text size="sm" c="dimmed">
						The camera applies them one at a time and pauses half a second
						between each, so this takes about {estimatedSeconds} seconds and the
						controls stay locked until it answers. The panel then writes
						camera.conf, which the camera's own page never does - that is why
						its settings revert on the next reboot.
					</Text>
					{switchingOff && (
						<Alert
							variant="light"
							color="red"
							title="This switches the video off"
							icon={<WarningCircle size={20} />}
						>
							With the camera switched off there is no stream, no snapshot and
							no recording until you switch it back on.
						</Alert>
					)}
					<Group justify="flex-end" gap="xs">
						<Button variant="default" onClick={closeConfirm}>
							Cancel
						</Button>
						<Button onClick={handleConfirm}>Apply</Button>
					</Group>
				</Stack>
			</Modal>
		</Card>
	);
};
