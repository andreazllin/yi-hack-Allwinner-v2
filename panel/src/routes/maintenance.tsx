import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const MaintenancePage: FunctionComponent = () => (
	<PagePlaceholder
		title="Maintenance"
		description="Reboot, reset, backup and firmware upgrade."
	/>
);

export const Route = createFileRoute("/maintenance")({
	component: MaintenancePage,
});
