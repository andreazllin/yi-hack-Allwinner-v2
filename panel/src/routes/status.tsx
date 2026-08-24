import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const StatusPage: FunctionComponent = () => (
	<PagePlaceholder
		title="Status"
		description="Device, network and firmware information."
	/>
);

export const Route = createFileRoute("/status")({
	component: StatusPage,
});
