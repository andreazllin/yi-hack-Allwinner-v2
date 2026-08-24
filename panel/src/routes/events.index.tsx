import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const EventsPage: FunctionComponent = () => (
	<PagePlaceholder
		title="Events"
		description="Recorded motion events by day and hour."
	/>
);

export const Route = createFileRoute("/events/")({
	component: EventsPage,
});
