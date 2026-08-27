import { createFileRoute } from "@tanstack/react-router";
import { ProxyPage } from "@/features/proxy/components/proxy-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/proxy")({
	head: () => ({ meta: [{ title: pageTitle("Proxy") }] }),
	component: ProxyPage,
});
