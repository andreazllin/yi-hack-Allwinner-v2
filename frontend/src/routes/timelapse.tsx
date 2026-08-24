import { createFileRoute } from "@tanstack/react-router";
import { TimelapsePage } from "@/features/timelapse/components/timelapse-page";

export const Route = createFileRoute("/timelapse")({
	component: TimelapsePage,
});
