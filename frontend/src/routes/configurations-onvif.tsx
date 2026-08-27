import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { SystemConfigForm } from "@/features/configurations/components/system-config-form";
import { ONVIF_CARDS } from "@/features/configurations/constants/onvif-cards";
import { pageTitle } from "@/lib/page-title";

const ConfigurationsOnvifPage: FunctionComponent = () => (
	<SystemConfigForm
		title="ONVIF Configuration"
		description="ONVIF server settings. They live in the same system.conf as the System Configuration page; the ONVIF service itself is enabled there."
		cards={ONVIF_CARDS}
		surface="ONVIF configuration"
	/>
);

export const Route = createFileRoute("/configurations-onvif")({
	head: () => ({ meta: [{ title: pageTitle("ONVIF") }] }),
	component: ConfigurationsOnvifPage,
});
