import { createFileRoute } from "@tanstack/react-router";
import { WifiPage } from "@/features/wifi/components/wifi-page";

export const Route = createFileRoute("/wifi")({
	component: WifiPage,
});
