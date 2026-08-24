import {
	Button,
	Card,
	Collapse,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { RecordingSettingsForm } from "@/features/events/components/recording-settings-form";
import { useSystemConfig } from "@/features/events/hooks/use-system-config";

export const RecordingSettingsCard: FunctionComponent = () => {
	const [opened, { toggle }] = useDisclosure(false);
	const { data, isPending, isError, refetch, dataUpdatedAt } =
		useSystemConfig(opened);

	return (
		<Card withBorder>
			<Group justify="space-between" wrap="nowrap" align="flex-start">
				<Stack gap={2}>
					<Title order={4}>Recording &amp; FTP settings</Title>
					<Text size="sm" c="dimmed">
						Auto video cleaning, the time the camera uses to save events, and
						FTP upload of recorded events.
					</Text>
				</Stack>
				<Button
					variant="default"
					onClick={toggle}
					rightSection={
						opened ? <CaretUp size={16} /> : <CaretDown size={16} />
					}
				>
					{opened ? "Hide" : "Edit"}
				</Button>
			</Group>
			{/* keepMounted={false}: nothing inside mounts until the card is opened,
			    so visiting Events does not read system.conf off the camera. */}
			<Collapse expanded={opened} keepMounted={false}>
				<Stack gap="md" pt="md">
					{isError && (
						<ErrorState
							title="Could not load the recording settings"
							description="The camera did not return system.conf. The recordings list above is unaffected."
							onRetry={() => refetch()}
						/>
					)}
					{!isError && isPending && (
						<Stack gap="md">
							<Skeleton height={56} />
							<Skeleton height={56} />
							<Skeleton height={20} width={180} />
							<Skeleton height={20} width={220} />
							<Skeleton height={20} width={200} />
							<Skeleton height={56} />
							<Skeleton height={56} />
						</Stack>
					)}
					{data && Object.keys(data).length === 0 && (
						<Text size="sm" c="dimmed">
							The camera returned no settings. system.conf may be missing or
							unreadable on the SD card.
						</Text>
					)}
					{data && Object.keys(data).length > 0 && (
						<RecordingSettingsForm conf={data} confUpdatedAt={dataUpdatedAt} />
					)}
				</Stack>
			</Collapse>
		</Card>
	);
};
