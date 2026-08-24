import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const ConfigurationsPage: FunctionComponent = () => (
	<PagePlaceholder
		title="System Configuration"
		description="Core firmware services and options."
	/>
);

export const Route = createFileRoute("/configurations")({
	component: ConfigurationsPage,
});
