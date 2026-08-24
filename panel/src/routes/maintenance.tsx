import { SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type FunctionComponent, useEffect, useState } from "react";
import { firmwareUpgradeQueryKey } from "@/api/@tanstack/react-query.gen";
import { BackupCard } from "@/features/maintenance/components/backup-card";
import { FactoryResetCard } from "@/features/maintenance/components/factory-reset-card";
import { FirmwareCard } from "@/features/maintenance/components/firmware-card";
import { RebootCard } from "@/features/maintenance/components/reboot-card";

const REBOOT_PROBE_MS = 60_000;

const MaintenancePage: FunctionComponent = () => {
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

	return (
		<Stack gap="md">
			<Title order={2}>Maintenance</Title>
			<Text c="dimmed" size="sm">
				Firmware, configuration backups, reboot and factory reset. Every action
				here interrupts the camera.
			</Text>
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
				<FirmwareCard disabled={rebooting} />
				<BackupCard disabled={rebooting} />
				<RebootCard
					rebooting={rebooting}
					onRebootStarted={() => setRebooting(true)}
				/>
				<FactoryResetCard disabled={rebooting} />
			</SimpleGrid>
		</Stack>
	);
};

export const Route = createFileRoute("/maintenance")({
	component: MaintenancePage,
});
