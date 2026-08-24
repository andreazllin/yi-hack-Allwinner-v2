import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const SpeakPage: FunctionComponent = () => (
	<PagePlaceholder
		title="Speak"
		description="Text-to-speech and audio playback through the camera speaker."
	/>
);

export const Route = createFileRoute("/speak")({
	component: SpeakPage,
});
