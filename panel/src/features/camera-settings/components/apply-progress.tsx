import { Group, Loader, Progress, Stack, Text } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { type FunctionComponent, useEffect, useState } from "react";
import { APPLY_TICK_MS } from "../constants/camera-settings";

type Props = {
	estimatedMs: number;
};

// The bar stops here and waits for the real response.
const CEILING_PERCENT = 95;

// This is an ESTIMATE OF POSITION, not telemetry. camera_settings.sh reports
// nothing until it has finished; the only thing known in advance is the cost of
// its sleeps (0.5s on each of 15 loop iterations, plus the extras). So the bar
// climbs on a timer at the firmware's own cadence, stops short of the end, and
// the label keeps saying "applying" until the request actually resolves.
export const ApplyProgress: FunctionComponent<Props> = ({ estimatedMs }) => {
	const reducedMotion = useReducedMotion();
	const [elapsedMs, setElapsedMs] = useState(0);

	useEffect(() => {
		if (reducedMotion) {
			return;
		}
		const interval = setInterval(() => {
			setElapsedMs((previous) => previous + APPLY_TICK_MS);
		}, APPLY_TICK_MS);
		return () => clearInterval(interval);
	}, [reducedMotion]);

	if (reducedMotion) {
		return (
			<Group gap="xs">
				<Loader size="xs" />
				<Text size="sm">Applying settings to the camera…</Text>
			</Group>
		);
	}

	const remainingSeconds = Math.ceil((estimatedMs - elapsedMs) / 1000);

	return (
		<Stack gap={6}>
			<Group justify="space-between" wrap="nowrap">
				<Text size="sm">Applying settings to the camera…</Text>
				<Text size="sm" c="dimmed">
					{remainingSeconds > 0
						? `about ${remainingSeconds}s left`
						: "waiting for the camera"}
				</Text>
			</Group>
			<Progress
				value={Math.min(CEILING_PERCENT, (elapsedMs / estimatedMs) * 100)}
			/>
		</Stack>
	);
};
