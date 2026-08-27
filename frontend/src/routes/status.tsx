import { createFileRoute } from "@tanstack/react-router";
import { StatusPage } from "@/features/status/components/status-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/status")({
	head: () => ({ meta: [{ title: pageTitle("Status") }] }),
	component: StatusPage,
});
