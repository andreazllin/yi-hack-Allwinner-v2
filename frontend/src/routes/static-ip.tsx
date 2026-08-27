import { createFileRoute } from "@tanstack/react-router";
import { StaticIpPage } from "@/features/static-ip/components/static-ip-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/static-ip")({
	head: () => ({ meta: [{ title: pageTitle("Static IP") }] }),
	component: StaticIpPage,
});
