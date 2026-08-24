import { Card, Skeleton, Stack } from "@mantine/core";
import type { FunctionComponent } from "react";

// Shaped like the four cards the form renders, so the page does not jump when
// camera.conf lands.
const SKELETON_CARDS: readonly { title: string; rows: readonly string[] }[] = [
	{ title: "Camera", rows: ["switch-on", "led", "ir", "rotate"] },
	{
		title: "Motion detection",
		rows: [
			"save-video",
			"motion",
			"sensitivity",
			"human",
			"vehicle",
			"animal",
			"face",
			"tracking",
		],
	},
	{ title: "Sound", rows: ["detection", "sensitivity"] },
	{ title: "Cruise", rows: ["cruise"] },
];

export const CameraSettingsSkeleton: FunctionComponent = () => (
	<Stack gap="md">
		{SKELETON_CARDS.map((card) => (
			<Card withBorder key={card.title}>
				<Stack gap="md">
					<Skeleton height={20} width={160} />
					{card.rows.map((row) => (
						<Skeleton height={34} key={`${card.title}-${row}`} />
					))}
				</Stack>
			</Card>
		))}
	</Stack>
);
