import { createFileRoute } from "@tanstack/react-router";
import { CameraSettingsPage } from "@/features/camera-settings/components/camera-settings-page";

export const Route = createFileRoute("/camera-settings")({
	component: CameraSettingsPage,
});
