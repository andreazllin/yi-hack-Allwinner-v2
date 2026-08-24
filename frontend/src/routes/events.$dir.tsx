import { Anchor, Badge, Group, Stack, Title } from "@mantine/core";
import { ArrowLeft } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { EventFilesCard } from "@/features/events/components/event-files-card";
import { isEventDirName } from "@/features/events/helpers/event-paths";

const EventsDirPage: FunctionComponent = () => {
	const { dir } = Route.useParams();

	return (
		<Stack gap="md">
			<Anchor component={Link} to="/events" size="sm">
				<Group gap={4} wrap="nowrap">
					<ArrowLeft size={14} />
					All events
				</Group>
			</Anchor>
			<Group justify="space-between">
				<Title order={2}>Recordings</Title>
				<Badge variant="light" ff="monospace">
					{dir}
				</Badge>
			</Group>
			{isEventDirName(dir) ? (
				<EventFilesCard dir={dir} />
			) : (
				<ErrorState
					title="Not an event directory"
					description="The camera names event directories like 2024Y08M24D15H, one per hour. This address does not match that, so nothing was requested from the camera."
				/>
			)}
		</Stack>
	);
};

export const Route = createFileRoute("/events/$dir")({
	component: EventsDirPage,
});
