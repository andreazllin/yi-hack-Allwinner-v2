import { createFileRoute } from "@tanstack/react-router";
import { MqttPage } from "@/features/mqtt/components/mqtt-page";

export const Route = createFileRoute("/mqtt")({
	component: MqttPage,
});
