import { createFileRoute } from "@tanstack/react-router";
import { MqttPage } from "@/features/mqtt/components/mqtt-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/mqtt")({
	head: () => ({ meta: [{ title: pageTitle("MQTT") }] }),
	component: MqttPage,
});
