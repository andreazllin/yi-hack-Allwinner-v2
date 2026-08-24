import { createFileRoute } from "@tanstack/react-router";
import { TzPage } from "@/features/tz/components/tz-page";

export const Route = createFileRoute("/tz")({
	component: TzPage,
});
