import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const ConfigurationsOnvifPage: FunctionComponent = () => (
	<PagePlaceholder title="ONVIF" description="ONVIF service configuration." />
);

export const Route = createFileRoute("/configurations-onvif")({
	component: ConfigurationsOnvifPage,
});
