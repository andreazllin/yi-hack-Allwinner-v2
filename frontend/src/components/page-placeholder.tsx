import { Stack, Text, Title } from "@mantine/core";
import type { FunctionComponent } from "react";

type Props = {
	title: string;
	description: string;
};

export const PagePlaceholder: FunctionComponent<Props> = ({
	title,
	description,
}) => (
	<Stack gap="xs">
		<Title order={2}>{title}</Title>
		<Text c="dimmed">{description}</Text>
		<Text size="sm" c="dimmed">
			This page is not implemented yet.
		</Text>
	</Stack>
);
