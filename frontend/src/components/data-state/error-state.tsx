import { Alert, Button, Stack, Text } from "@mantine/core";
import { WarningCircle } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";

type Props = {
	title: string;
	description: string;
	onRetry?: () => void;
};

// Error surfaces say what failed in copy specific to the surface and offer
// a retry wired to the query's own refetch — not a page reload.
export const ErrorState: FunctionComponent<Props> = ({
	title,
	description,
	onRetry,
}) => (
	<Alert
		variant="light"
		color="red"
		title={title}
		icon={<WarningCircle size={20} />}
	>
		<Stack gap="xs" align="flex-start">
			<Text size="sm">{description}</Text>
			{onRetry && (
				<Button variant="default" size="xs" onClick={onRetry}>
					Retry
				</Button>
			)}
		</Stack>
	</Alert>
);
