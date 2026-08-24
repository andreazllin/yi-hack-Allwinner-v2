import { createFileRoute } from "@tanstack/react-router";
import { StatusPage } from "@/features/status/components/status-page";

export const Route = createFileRoute("/status")({
	component: StatusPage,
});
