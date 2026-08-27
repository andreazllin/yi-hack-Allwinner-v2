import { createFileRoute } from "@tanstack/react-router";
import { MaintenancePage } from "@/features/maintenance/components/maintenance-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/maintenance")({
	head: () => ({ meta: [{ title: pageTitle("Maintenance") }] }),
	component: MaintenancePage,
});
