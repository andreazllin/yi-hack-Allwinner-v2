import { Button, Card, Stack, Text, Title } from "@mantine/core";
import type { FunctionComponent } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { CameraSettingsForm } from "@/features/camera-settings/components/camera-settings-form";
import { CameraSettingsSkeleton } from "@/features/camera-settings/components/camera-settings-skeleton";
import { isCameraConfEmpty } from "@/features/camera-settings/helpers/camera-settings";
import { useCameraConf } from "@/features/camera-settings/hooks/use-camera-conf";
import { useCameraStatus } from "@/features/camera-settings/hooks/use-camera-status";

export const CameraSettingsPage: FunctionComponent = () => {
	const conf = useCameraConf();
	const status = useCameraStatus();

	// Both reads gate the page: camera.conf holds the values and status.json says
	// whether the camera can pan and tilt. Guessing the second one would show
	// controls that do nothing, or hide controls that work.
	if (conf.isError || status.isError) {
		return (
			<Stack gap="md">
				<Title order={2}>Camera Settings</Title>
				<ErrorState
					title="Could not load camera settings"
					description="The camera did not answer get_configs.sh?conf=camera or status.json. Check that it is reachable (and CAM_HOST in dev)."
					onRetry={() => {
						conf.refetch();
						status.refetch();
					}}
				/>
			</Stack>
		);
	}

	if (conf.isPending || status.isPending) {
		return (
			<Stack gap="md">
				<Title order={2}>Camera Settings</Title>
				<CameraSettingsSkeleton />
			</Stack>
		);
	}

	if (isCameraConfEmpty(conf.data)) {
		return (
			<Stack gap="md">
				<Title order={2}>Camera Settings</Title>
				<Card withBorder>
					<Stack gap="xs" align="flex-start">
						<Text size="sm">
							The camera answered, but its camera.conf held none of the expected
							settings - the reply carried only the firmware version. Editing
							from here would write fifteen default values over whatever the
							camera is actually running, so nothing is shown.
						</Text>
						<Button variant="default" size="xs" onClick={() => conf.refetch()}>
							Reload
						</Button>
					</Stack>
				</Card>
			</Stack>
		);
	}

	return (
		<Stack gap="md">
			<Title order={2}>Camera Settings</Title>
			<Text size="sm" c="dimmed">
				Changes are batched: nothing reaches the camera until you apply them.
				Applying takes effect immediately and is then written to camera.conf so
				it survives a reboot. These settings are not synchronised with the ones
				made in the Yi app.
			</Text>
			<CameraSettingsForm conf={conf.data} isPtz={status.data.ptz === "yes"} />
		</Stack>
	);
};
