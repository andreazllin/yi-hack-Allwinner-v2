import { Slider, Stack, Text } from "@mantine/core";
import type { FunctionComponent } from "react";
import {
	VOLUME_MAX_DB,
	VOLUME_MIN_DB,
	VOLUME_STEP_DB,
} from "@/features/speak/constants/audio";

type Props = {
	value: number;
	onChange: (value: number) => void;
	disabled?: boolean;
};

export const VolumeSlider: FunctionComponent<Props> = ({
	value,
	onChange,
	disabled,
}) => (
	<Stack gap={4}>
		<Text size="sm" fw={500}>
			Volume
		</Text>
		<Slider
			value={value}
			onChange={onChange}
			disabled={disabled}
			min={VOLUME_MIN_DB}
			max={VOLUME_MAX_DB}
			step={VOLUME_STEP_DB}
			marks={MARKS}
			label={formatDb}
			mb="lg"
		/>
	</Stack>
);

function formatDb(value: number): string {
	return `${value > 0 ? "+" : ""}${value} dB`;
}

const MARKS = [VOLUME_MIN_DB, 0, VOLUME_MAX_DB].map((value) => ({
	value,
	label: formatDb(value),
}));
