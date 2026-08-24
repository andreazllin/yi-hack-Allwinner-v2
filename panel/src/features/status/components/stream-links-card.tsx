import {
	Anchor,
	Card,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import type { FunctionComponent } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { useLinks } from "@/features/status/hooks/use-links";

const LINK_LABELS: {
	key:
		| "high_res_stream"
		| "low_res_stream"
		| "audio_stream"
		| "high_res_snapshot"
		| "low_res_snapshot";
	label: string;
}[] = [
	{ key: "high_res_stream", label: "High-res stream (RTSP)" },
	{ key: "low_res_stream", label: "Low-res stream (RTSP)" },
	{ key: "audio_stream", label: "Audio stream (RTSP)" },
	{ key: "high_res_snapshot", label: "High-res snapshot" },
	{ key: "low_res_snapshot", label: "Low-res snapshot" },
];

export const StreamLinksCard: FunctionComponent = () => {
	const { data, isPending, isError, refetch } = useLinks();

	return (
		<Card withBorder>
			<Stack gap="xs">
				<Title order={4}>Streams & Snapshots</Title>
				{isError && (
					<ErrorState
						title="Could not load stream links"
						description="links.sh did not answer, so the RTSP and snapshot URLs are unknown."
						onRetry={() => refetch()}
					/>
				)}
				{LINK_LABELS.map(({ key, label }) => {
					// Stream rows are conditional on RTSP config — hide absent ones,
					// exactly like the stock UI does.
					if (!isPending && !data?.[key]) {
						return null;
					}
					const url = data?.[key];
					return (
						<Group key={key} justify="space-between" wrap="nowrap" gap="md">
							<Text size="sm" c="dimmed">
								{label}
							</Text>
							{isPending || !url ? (
								<Skeleton height={16} width={180} />
							) : (
								<Anchor
									size="sm"
									ff="monospace"
									href={url}
									target="_blank"
									rel="noreferrer"
									style={{ wordBreak: "break-all" }}
								>
									{url}
								</Anchor>
							)}
						</Group>
					);
				})}
			</Stack>
		</Card>
	);
};
