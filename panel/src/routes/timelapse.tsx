import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const TimelapsePage: FunctionComponent = () => (
	<PagePlaceholder
		title="Timelapse"
		description="Timelapse capture configuration."
	/>
);

export const Route = createFileRoute("/timelapse")({
	component: TimelapsePage,
});
