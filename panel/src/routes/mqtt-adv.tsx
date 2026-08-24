import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const MqttAdvPage: FunctionComponent = () => (
	<PagePlaceholder
		title="MQTT Advanced"
		description="Advanced MQTT topic configuration."
	/>
);

export const Route = createFileRoute("/mqtt-adv")({
	component: MqttAdvPage,
});
