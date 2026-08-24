import { createFileRoute } from "@tanstack/react-router";
import { SnapshotPage } from "@/features/snapshot/components/snapshot-page";

export const Route = createFileRoute("/snapshot")({
	component: SnapshotPage,
});
