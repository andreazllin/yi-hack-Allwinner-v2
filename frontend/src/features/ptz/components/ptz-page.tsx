import { Card, SimpleGrid, Skeleton, Stack, Text, Title } from "@mantine/core";
import { Info } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { MovePadCard } from "@/features/ptz/components/move-pad-card";
import { PresetsCard } from "@/features/ptz/components/presets-card";
import { PreviewCard } from "@/features/ptz/components/preview-card";
import { usePtzSupport } from "@/features/ptz/hooks/use-ptz-support";

export const PtzPage: FunctionComponent = () => {
	const { data, isPending, isError, refetch } = usePtzSupport();

	if (isError) {
		return (
			<Stack gap="md">
				<Title order={2}>PTZ</Title>
				<ErrorState
					title="Could not read the camera status"
					description="status.json decides whether this model has PTZ motors, and the camera did not answer it. Check that it is reachable (and CAM_HOST in dev)."
					onRetry={() => refetch()}
				/>
			</Stack>
		);
	}

	if (isPending) {
		return (
			<Stack gap="md">
				<Title order={2}>PTZ</Title>
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
					<Skeleton height={240} radius="md" />
					<Skeleton height={240} radius="md" />
				</SimpleGrid>
				<Skeleton height={280} radius="md" />
			</Stack>
		);
	}

	// The camera derives `ptz` from the same model allowlist the stock UI
	// hardcodes, so this is a feature detect rather than a version check.
	if (data?.ptz !== "yes") {
		return (
			<Stack gap="md">
				<Title order={2}>PTZ</Title>
				<Card withBorder>
					<Stack gap="xs">
						<Info size={24} />
						<Title order={4}>This camera has no PTZ motors</Title>
						<Text size="sm" c="dimmed">
							{`status.json reports ptz=${data?.ptz ?? "unknown"} for model ${data?.model_suffix ?? "unknown"}, so there is nothing to move and no preset to store. Movement and presets stay hidden rather than failing silently on the camera.`}
						</Text>
					</Stack>
				</Card>
			</Stack>
		);
	}

	return (
		<Stack gap="md">
			<Title order={2}>PTZ</Title>
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
				<MovePadCard />
				<PreviewCard />
			</SimpleGrid>
			<PresetsCard />
		</Stack>
	);
};
