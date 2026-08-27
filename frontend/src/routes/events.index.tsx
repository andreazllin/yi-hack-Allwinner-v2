import { Stack, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { EventDirsCard } from "@/features/events/components/event-dirs-card";
import { RecordingSettingsCard } from "@/features/events/components/recording-settings-card";
import { pageTitle } from "@/lib/page-title";

const EventsPage: FunctionComponent = () => (
	<Stack gap="md">
		<Title order={2}>Events</Title>
		<EventDirsCard />
		<RecordingSettingsCard />
	</Stack>
);

export const Route = createFileRoute("/events/")({
	head: () => ({ meta: [{ title: pageTitle("Events") }] }),
	component: EventsPage,
});
