import { createFileRoute } from "@tanstack/react-router";
import { MqttAdvPage } from "@/features/mqtt/components/mqtt-adv-page";

export const Route = createFileRoute("/mqtt-adv")({
	component: MqttAdvPage,
});
