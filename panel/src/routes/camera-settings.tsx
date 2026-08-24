import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const CameraSettingsPage: FunctionComponent = () => (
	<PagePlaceholder
		title="Camera Settings"
		description="Detection, indicators and behavior toggles."
	/>
);

export const Route = createFileRoute("/camera-settings")({
	component: CameraSettingsPage,
});
