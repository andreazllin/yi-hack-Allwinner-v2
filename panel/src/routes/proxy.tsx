import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const ProxyPage: FunctionComponent = () => (
	<PagePlaceholder title="Proxy" description="proxychains-ng configuration." />
);

export const Route = createFileRoute("/proxy")({
	component: ProxyPage,
});
