import {
	Alert,
	Button,
	Card,
	FileInput,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DownloadSimple, UploadSimple } from "@phosphor-icons/react";
import { type FunctionComponent, useEffect, useState } from "react";
import { ConfirmModal } from "@/features/maintenance/components/confirm-modal";
import {
	MAX_CONFIG_ARCHIVE_BYTES,
	parseRestoreResult,
} from "@/features/maintenance/helpers/restore";
import { useRestoreConfig } from "@/features/maintenance/hooks/use-restore-config";
import { cameraPath } from "@/lib/camera-url";

type Props = {
	// Reported upward so the other cards can lock while this one holds the
	// camera — a reboot during a firmware flash is the dangerous direction.
	onBusyChange: (busy: boolean) => void;
	disabled: boolean;
};

export const BackupCard: FunctionComponent<Props> = ({
	disabled,
	onBusyChange,
}) => {
	const restore = useRestoreConfig();
	const [archive, setArchive] = useState<File | null>(null);
	const [confirmOpened, confirm] = useDisclosure(false);

	const tooLarge = archive !== null && archive.size > MAX_CONFIG_ARCHIVE_BYTES;
	const result = restore.isSuccess ? parseRestoreResult(restore.data) : null;

	const runRestore = () => {
		if (archive === null) {
			return;
		}
		confirm.close();
		restore.mutate({ body: { "files[]": archive } });
	};

	useEffect(() => {
		onBusyChange(restore.isPending);
	}, [restore.isPending, onBusyChange]);

	return (
		<Card withBorder>
			<Stack gap="sm">
				<Title order={4}>Configuration backup</Title>
				<Text size="sm" c="dimmed">
					save.sh packs every etc/*.conf plus the hostname into config.tar.bz2;
					load.sh restores such an archive.
				</Text>
				<Group>
					{/* A plain anchor: the browser writes the attachment straight to disk.
					    Routing the binary through the SDK would only buffer a blob and
					    hand-roll an object URL to get the same download. */}
					<Button
						component="a"
						href={cameraPath("/cgi-bin/save.sh")}
						download="config.tar.bz2"
						variant="default"
						leftSection={<DownloadSimple size={16} />}
					>
						Download backup
					</Button>
				</Group>
				<FileInput
					label="Restore from a backup archive"
					description={`config.tar.bz2 containing at least system.conf and camera.conf. load.sh drops any request over 10000 bytes without a message, so archives above ${MAX_CONFIG_ARCHIVE_BYTES.toLocaleString()} bytes are blocked here.`}
					placeholder="Select config.tar.bz2"
					accept=".bz2,.tar.bz2,application/x-bzip2"
					clearable
					value={archive}
					onChange={setArchive}
					error={
						tooLarge
							? `This file is ${archive.size.toLocaleString()} bytes — too large for load.sh.`
							: undefined
					}
					disabled={disabled || restore.isPending}
				/>
				{result && (
					<Alert
						variant="light"
						color={result.ok ? "teal" : "red"}
						title={result.ok ? "Configuration restored" : "Restore failed"}
					>
						<Stack gap="xs">
							<Text size="sm" ff="monospace">
								{result.message}
							</Text>
							{result.ok && (
								<Text size="sm">
									Reboot the camera to run the services with the restored
									configuration.
								</Text>
							)}
						</Stack>
					</Alert>
				)}
				<Group>
					<Button
						leftSection={<UploadSimple size={16} />}
						loading={restore.isPending}
						disabled={disabled || archive === null || tooLarge}
						onClick={confirm.open}
					>
						Restore configuration
					</Button>
				</Group>
			</Stack>
			<ConfirmModal
				opened={confirmOpened}
				title="Overwrite the camera configuration?"
				confirmLabel="Upload and restore"
				loading={restore.isPending}
				onClose={confirm.close}
				onConfirm={runRestore}
			>
				<Text size="sm">
					The archive replaces the configuration files on the camera, including
					hostname, WiFi and credentials. Anything you have not backed up is
					lost. Download a backup first if you are unsure.
				</Text>
				<Text size="sm">
					load.sh applies the camera settings from the archive immediately
					afterwards; the services keep running with the old configuration until
					you reboot.
				</Text>
			</ConfirmModal>
		</Card>
	);
};
