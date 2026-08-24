import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const EventsDirPage: FunctionComponent = () => (
	<PagePlaceholder
		title="Event Recordings"
		description="Recordings inside one event directory."
	/>
);

export const Route = createFileRoute("/events/$dir")({
	component: EventsDirPage,
});
