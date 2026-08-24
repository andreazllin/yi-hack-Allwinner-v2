import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const WifiPage: FunctionComponent = () => (
	<PagePlaceholder
		title="WiFi"
		description="Wireless network scan and credentials."
	/>
);

export const Route = createFileRoute("/wifi")({
	component: WifiPage,
});
