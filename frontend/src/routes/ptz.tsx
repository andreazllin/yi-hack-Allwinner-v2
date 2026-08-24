import { createFileRoute } from "@tanstack/react-router";
import { PtzPage } from "@/features/ptz/components/ptz-page";

export const Route = createFileRoute("/ptz")({
	component: PtzPage,
});
