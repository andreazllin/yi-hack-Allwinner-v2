import { createFileRoute } from "@tanstack/react-router";
import { ProxyPage } from "@/features/proxy/components/proxy-page";

export const Route = createFileRoute("/proxy")({
	component: ProxyPage,
});
