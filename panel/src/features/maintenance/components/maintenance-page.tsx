import { SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import {
	type FunctionComponent,
	useCallback,
	useEffect,
	useState,
} from "react";
import { firmwareUpgradeQueryKey } from "@/api/@tanstack/react-query.gen";
import { BackupCard } from "@/features/maintenance/components/backup-card";
import { FactoryResetCard } from "@/features/maintenance/components/factory-reset-card";
import { FirmwareCard } from "@/features/maintenance/components/firmware-card";
import { RebootCard } from "@/features/maintenance/components/reboot-card";

const REBOOT_PROBE_MS = 60_000;

export const MaintenancePage: FunctionComponent = () => {
	const queryClient = useQueryClient();
	const [rebooting, setRebooting] = useState(false);

	useEffect(() => {
		if (!rebooting) {
			return;
		}
		// One deliberate probe, not a poll: every /cgi-bin hit forks a shell on the
		// camera, and it is unreachable for most of this window anyway. Invalidating
		// refetches only the mounted firmware query, so this is a single request.
		const timer = window.setTimeout(() => {
			void queryClient.invalidateQueries({
				queryKey: firmwareUpgradeQueryKey({ query: { get: "info" } }),
			});
		}, REBOOT_PROBE_MS);
		return () => window.clearTimeout(timer);
	}, [rebooting, queryClient]);

	// Any action that holds the camera locks every other one. Gating only on
	// `rebooting` was one-directional: a reboot could still be fired in the
	// middle of a firmware flash, which is the direction that bricks the device.
	const [busy, setBusyState] = useState<Record<string, boolean>>({});
	const setBusy = useCallback((card: string, value: boolean) => {
		setBusyState((current) =>
			current[card] === value ? current : { ...current, [card]: value },
		);
	}, []);
	const busyElsewhere = (card: string) =>
		Object.entries(busy).some(([key, value]) => value && key !== card);

	return (
		<Stack gap="md">
			<Title order={2}>Maintenance</Title>
			<Text c="dimmed" size="sm">
				Firmware, configuration backups, reboot and factory reset. Every action
				here interrupts the camera.
			</Text>
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
				<FirmwareCard
					disabled={rebooting || busyElsewhere("firmware")}
					onBusyChange={(busy) => setBusy("firmware", busy)}
				/>
				<BackupCard
					disabled={rebooting || busyElsewhere("backup")}
					onBusyChange={(busy) => setBusy("backup", busy)}
				/>
				<RebootCard
					rebooting={rebooting}
					disabled={busyElsewhere("reboot")}
					onRebootStarted={() => setRebooting(true)}
					onBusyChange={(busy) => setBusy("reboot", busy)}
				/>
				<FactoryResetCard
					disabled={rebooting || busyElsewhere("factoryReset")}
					onBusyChange={(busy) => setBusy("factoryReset", busy)}
				/>
			</SimpleGrid>
		</Stack>
	);
};
