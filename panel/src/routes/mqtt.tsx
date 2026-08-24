import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const MqttPage: FunctionComponent = () => (
	<PagePlaceholder
		title="MQTT"
		description="MQTT broker connection and topics."
	/>
);

export const Route = createFileRoute("/mqtt")({
	component: MqttPage,
});
