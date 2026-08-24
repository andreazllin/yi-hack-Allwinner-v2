import { Card, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import type { FunctionComponent } from "react";
import type { ConfigSectionSpec } from "@/features/mqtt/helpers/field-spec";

type Props = {
	sections: ConfigSectionSpec[];
};

// Shaped like the loaded form — one card per section, one input-sized block
// per control — so the page does not jump when the config lands.
export const ConfigFormSkeleton: FunctionComponent<Props> = ({ sections }) => (
	<Stack gap="md">
		{sections.map((section) => (
			<Card withBorder key={section.title}>
				<Stack gap="md">
					<Skeleton height={20} width={200} />
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
						{section.fields.map((field) => (
							<Skeleton height={56} key={field.name} />
						))}
					</SimpleGrid>
				</Stack>
			</Card>
		))}
	</Stack>
);
