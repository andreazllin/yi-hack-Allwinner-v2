import { createFileRoute } from "@tanstack/react-router";
import { PtzPage } from "@/features/ptz/components/ptz-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/ptz")({
	head: () => ({ meta: [{ title: pageTitle("PTZ") }] }),
	component: PtzPage,
});
