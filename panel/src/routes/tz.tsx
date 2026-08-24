import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const TzPage: FunctionComponent = () => (
	<PagePlaceholder
		title="Time Zone"
		description="Camera time zone configuration."
	/>
);

export const Route = createFileRoute("/tz")({
	component: TzPage,
});
