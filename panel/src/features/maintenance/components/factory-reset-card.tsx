import {
	Alert,
	Button,
	Card,
	Group,
	List,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { type FunctionComponent, useState } from "react";
import { ConfirmModal } from "@/features/maintenance/components/confirm-modal";
import { useResetConfig } from "@/features/maintenance/hooks/use-reset-config";

type Props = {
	disabled: boolean;
};

const CONFIRM_WORD = "RESET";

export const FactoryResetCard: FunctionComponent<Props> = ({ disabled }) => {
	const reset = useResetConfig();
	const [confirmOpened, confirm] = useDisclosure(false);
	const [typed, setTyped] = useState("");

	const close = () => {
		confirm.close();
		setTyped("");
	};

	const runReset = () => {
		close();
		reset.mutate();
	};

	return (
		<Card withBorder>
			<Stack gap="sm">
				<Title order={4}>Reset to yi-hack defaults</Title>
				<Text size="sm" c="dimmed">
					reset.sh deletes the hostname file and the camera, mqttv4, proxychains
					and system configuration files, then unpacks defaults.tar.bz2 over
					them. It does not reboot.
				</Text>
				{reset.isSuccess && (
					<Alert variant="light" color="orange" title="Reset completed">
						<Text size="sm">
							The defaults are in place. Reboot the camera to run with them —
							and note reset.sh reports success even when a delete or the
							extraction failed, so verify your settings afterwards.
						</Text>
					</Alert>
				)}
				<Group>
					<Button
						color="red"
						leftSection={<ArrowCounterClockwise size={16} />}
						loading={reset.isPending}
						disabled={disabled}
						onClick={confirm.open}
					>
						Reset configuration
					</Button>
				</Group>
			</Stack>
			<ConfirmModal
				opened={confirmOpened}
				title="Reset the configuration to defaults?"
				confirmLabel="Reset configuration"
				loading={reset.isPending}
				confirmDisabled={typed.trim() !== CONFIRM_WORD}
				onClose={close}
				onConfirm={runReset}
			>
				<Text size="sm">This wipes and replaces:</Text>
				<List size="sm" spacing="xs">
					<List.Item>the camera hostname</List.Item>
					<List.Item>
						camera settings (detection, LEDs, rotation, cruise)
					</List.Item>
					<List.Item>
						system settings — RTSP/ONVIF/SSH/FTP, ports, WiFi and HTTP
						credentials, crontab, time-lapse
					</List.Item>
					<List.Item>the MQTT and proxychains configuration</List.Item>
				</List>
				<Text size="sm">
					You may lose access to the camera over the network: with default
					credentials and hostname restored, this panel and the streams have to
					be reached again on the new settings. The camera does not reboot on
					its own — reboot it afterwards.
				</Text>
				<TextInput
					label={`Type ${CONFIRM_WORD} to confirm`}
					placeholder={CONFIRM_WORD}
					value={typed}
					onChange={(event) => setTyped(event.currentTarget.value)}
				/>
			</ConfirmModal>
		</Card>
	);
};
