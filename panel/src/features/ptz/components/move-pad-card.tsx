import {
	ActionIcon,
	Card,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import {
	ArrowDown,
	ArrowDownLeft,
	ArrowDownRight,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	ArrowUpLeft,
	ArrowUpRight,
	House,
	type Icon,
} from "@phosphor-icons/react";
import type { FunctionComponent } from "react";
import {
	type PtzDirection,
	usePtzMove,
} from "@/features/ptz/hooks/use-ptz-move";
import { usePtzPreset } from "@/features/ptz/hooks/use-ptz-preset";

// The centre of the pad is not a direction: the stock UI wires it to
// preset 0, which the firmware treats as the home position.
type PadAction = PtzDirection | "home";

type PadButton = {
	action: PadAction;
	icon: Icon;
	label: string;
};

const PAD_BUTTONS: PadButton[] = [
	{ action: "up_left", icon: ArrowUpLeft, label: "Move up and left" },
	{ action: "up", icon: ArrowUp, label: "Move up" },
	{ action: "up_right", icon: ArrowUpRight, label: "Move up and right" },
	{ action: "left", icon: ArrowLeft, label: "Move left" },
	{ action: "home", icon: House, label: "Go to preset 0 (home)" },
	{ action: "right", icon: ArrowRight, label: "Move right" },
	{ action: "down_left", icon: ArrowDownLeft, label: "Move down and left" },
	{ action: "down", icon: ArrowDown, label: "Move down" },
	{ action: "down_right", icon: ArrowDownRight, label: "Move down and right" },
];

export const MovePadCard: FunctionComponent = () => {
	const move = usePtzMove();
	const goHome = usePtzPreset();

	// One move at a time: every press forks a shell on the camera, and the
	// motor cannot serve two commands at once anyway.
	const busy = move.isPending || goHome.isPending;
	const active: PadAction | null = move.isPending
		? (move.variables ?? null)
		: goHome.isPending
			? "home"
			: null;

	const run = (action: PadAction) => {
		if (action === "home") {
			goHome.mutate({ action: "go_preset", num: "0" });
			return;
		}
		move.mutate(action);
	};

	return (
		<Card withBorder>
			<Stack gap="md">
				<Stack gap={4}>
					<Title order={4}>Move</Title>
					<Text size="sm" c="dimmed">
						Each press steps the motor for about 0.3 s and stops. The camera
						reports success even when it did not move, so watch the preview.
					</Text>
				</Stack>
				<SimpleGrid cols={3} spacing="xs" maw={200}>
					{PAD_BUTTONS.map(({ action, icon: PadIcon, label }) => (
						<ActionIcon
							key={action}
							aria-label={label}
							variant={action === "home" ? "light" : "default"}
							size="xl"
							disabled={busy && active !== action}
							loading={active === action}
							onClick={() => run(action)}
						>
							<PadIcon size={22} />
						</ActionIcon>
					))}
				</SimpleGrid>
			</Stack>
		</Card>
	);
};
