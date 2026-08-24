import { Card, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import type { FunctionComponent, ReactNode } from "react";

export type InfoRow = {
	label: string;
	value: ReactNode;
};

type Props = {
	title: string;
	rows: InfoRow[];
	pending: boolean;
};

export const InfoCard: FunctionComponent<Props> = ({
	title,
	rows,
	pending,
}) => (
	<Card withBorder>
		<Stack gap="xs">
			<Title order={4}>{title}</Title>
			{rows.map((row) => (
				<Group key={row.label} justify="space-between" wrap="nowrap" gap="md">
					<Text size="sm" c="dimmed">
						{row.label}
					</Text>
					{pending ? (
						<Skeleton height={16} width={120} />
					) : (
						<Text
							size="sm"
							ff="monospace"
							ta="right"
							style={{ wordBreak: "break-all" }}
						>
							{row.value ?? "—"}
						</Text>
					)}
				</Group>
			))}
		</Stack>
	</Card>
);
