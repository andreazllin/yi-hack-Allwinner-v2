import { createFileRoute } from "@tanstack/react-router";
import { CameraSettingsPage } from "@/features/camera-settings/components/camera-settings-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/camera-settings")({
	head: () => ({ meta: [{ title: pageTitle("Camera Settings") }] }),
	component: CameraSettingsPage,
});
