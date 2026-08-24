import { Stack, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { EventDirsCard } from "@/features/events/components/event-dirs-card";
import { RecordingSettingsCard } from "@/features/events/components/recording-settings-card";

const EventsPage: FunctionComponent = () => (
	<Stack gap="md">
		<Title order={2}>Events</Title>
		<EventDirsCard />
		<RecordingSettingsCard />
	</Stack>
);

export const Route = createFileRoute("/events/")({
	component: EventsPage,
});
