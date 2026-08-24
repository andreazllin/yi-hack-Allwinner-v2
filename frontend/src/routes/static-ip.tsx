import { createFileRoute } from "@tanstack/react-router";
import { StaticIpPage } from "@/features/static-ip/components/static-ip-page";

export const Route = createFileRoute("/static-ip")({
	component: StaticIpPage,
});
