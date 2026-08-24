import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { FunctionComponent, ReactNode } from "react";

type Props = {
	title: string;
	description?: string;
	children: ReactNode;
};

export const ConfigSection: FunctionComponent<Props> = ({
	title,
	description,
	children,
}) => (
	<Card withBorder>
		<Stack gap="md">
			<Stack gap={2}>
				<Title order={4}>{title}</Title>
				{description && (
					<Text size="sm" c="dimmed">
						{description}
					</Text>
				)}
			</Stack>
			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
				{children}
			</SimpleGrid>
		</Stack>
	</Card>
);
