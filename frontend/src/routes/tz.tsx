import { createFileRoute } from "@tanstack/react-router";
import { TzPage } from "@/features/tz/components/tz-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/tz")({
	head: () => ({ meta: [{ title: pageTitle("Time Zone") }] }),
	component: TzPage,
});
