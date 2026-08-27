import { createFileRoute } from "@tanstack/react-router";
import { WifiPage } from "@/features/wifi/components/wifi-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/wifi")({
	head: () => ({ meta: [{ title: pageTitle("WiFi") }] }),
	component: WifiPage,
});
