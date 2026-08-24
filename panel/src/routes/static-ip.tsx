import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const StaticIpPage: FunctionComponent = () => (
	<PagePlaceholder
		title="Static IP"
		description="Static network address configuration."
	/>
);

export const Route = createFileRoute("/static-ip")({
	component: StaticIpPage,
});
