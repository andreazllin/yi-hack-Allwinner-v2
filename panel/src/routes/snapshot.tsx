import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const SnapshotPage: FunctionComponent = () => (
	<PagePlaceholder
		title="Snapshot"
		description="Grab a frame from the camera."
	/>
);

export const Route = createFileRoute("/snapshot")({
	component: SnapshotPage,
});
