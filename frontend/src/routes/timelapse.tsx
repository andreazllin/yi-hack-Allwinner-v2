import { createFileRoute } from "@tanstack/react-router";
import { TimelapsePage } from "@/features/timelapse/components/timelapse-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/timelapse")({
	head: () => ({ meta: [{ title: pageTitle("Timelapse") }] }),
	component: TimelapsePage,
});
