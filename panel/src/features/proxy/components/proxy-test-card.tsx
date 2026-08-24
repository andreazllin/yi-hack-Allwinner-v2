import {
	Button,
	Card,
	Code,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import type { FunctionComponent } from "react";
import type { ProxyResult } from "@/api";
import { ErrorState } from "@/components/data-state/error-state";

type Props = {
	title: string;
	description: string;
	pending: boolean;
	isError: boolean;
	result: ProxyResult | undefined;
	onTest: () => void;
};

export const ProxyTestCard: FunctionComponent<Props> = ({
	title,
	description,
	pending,
	isError,
	result,
	onTest,
}) => (
	<Card withBorder>
		<Stack gap="md">
			<div>
				<Title order={4}>{title}</Title>
				<Text size="sm" c="dimmed">
					{description}
				</Text>
			</div>
			<Button variant="default" loading={pending} onClick={onTest}>
				Run test
			</Button>
			{pending ? (
				<Skeleton height={180} />
			) : isError ? (
				<ErrorState
					title="The test returned nothing usable"
					description="The camera answered without a readable result. That is what a failed outbound request looks like here: wget returns nothing and the script's JSON ends up malformed."
					onRetry={onTest}
				/>
			) : result === undefined ? (
				<Text size="sm" c="dimmed">
					Not tested yet.
				</Text>
			) : result.result === undefined ? (
				<Text size="sm">
					The camera reported success but sent no result, so the outbound
					request produced no body.
				</Text>
			) : (
				<Code block>{JSON.stringify(result.result, null, 2)}</Code>
			)}
		</Stack>
	</Card>
);
