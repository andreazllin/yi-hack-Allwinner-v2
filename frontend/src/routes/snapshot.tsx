import { createFileRoute } from "@tanstack/react-router";
import { SnapshotPage } from "@/features/snapshot/components/snapshot-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/snapshot")({
	head: () => ({ meta: [{ title: pageTitle("Snapshot") }] }),
	component: SnapshotPage,
});
