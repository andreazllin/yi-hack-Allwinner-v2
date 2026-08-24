import { Button, Card, Group, Stack, Text } from "@mantine/core";
import { FloppyDisk } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";

type Props = {
	changedCount: number;
	saving: boolean;
	onSave: () => void;
};

// Replaces the stock 'Saving...'/'Saved' status text next to the save button,
// and keeps the notice both stock MQTT pages print there.
export const SaveBar: FunctionComponent<Props> = ({
	changedCount,
	saving,
	onSave,
}) => (
	<Card withBorder>
		<Group justify="space-between" gap="md" wrap="wrap">
			<Stack gap={2}>
				<Text size="sm">
					{changedCount === 0
						? "No unsaved changes"
						: `${changedCount} unsaved change${changedCount === 1 ? "" : "s"}`}
				</Text>
				<Text size="xs" c="dimmed">
					Changes take effect after the camera reboots.
				</Text>
			</Stack>
			<Button
				onClick={onSave}
				loading={saving}
				disabled={changedCount === 0}
				leftSection={<FloppyDisk size={16} />}
			>
				Save configuration
			</Button>
		</Group>
	</Card>
);
