import { Button, Group, Modal, Stack } from "@mantine/core";
import type { FunctionComponent, ReactNode } from "react";

type Props = {
	opened: boolean;
	title: string;
	confirmLabel: string;
	loading: boolean;
	confirmDisabled?: boolean;
	onClose: () => void;
	onConfirm: () => void;
	children: ReactNode;
};

// Every action on this page is destructive or takes the camera offline, so
// each one goes through this modal spelling out the consequences first.
export const ConfirmModal: FunctionComponent<Props> = ({
	opened,
	title,
	confirmLabel,
	loading,
	confirmDisabled,
	onClose,
	onConfirm,
	children,
}) => (
	<Modal opened={opened} onClose={onClose} title={title} centered>
		<Stack gap="md">
			{children}
			<Group justify="flex-end">
				<Button variant="default" onClick={onClose}>
					Cancel
				</Button>
				<Button
					color="red"
					loading={loading}
					disabled={confirmDisabled}
					onClick={onConfirm}
				>
					{confirmLabel}
				</Button>
			</Group>
		</Stack>
	</Modal>
);
