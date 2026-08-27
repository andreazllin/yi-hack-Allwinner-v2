import { createFileRoute } from "@tanstack/react-router";
import { MqttAdvPage } from "@/features/mqtt/components/mqtt-adv-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/mqtt-adv")({
	head: () => ({ meta: [{ title: pageTitle("MQTT Advanced") }] }),
	component: MqttAdvPage,
});
