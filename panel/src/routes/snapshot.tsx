import {
	Button,
	Card,
	Group,
	SegmentedControl,
	Stack,
	Switch,
	Text,
	Title,
} from "@mantine/core";
import { ArrowClockwise } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { type FunctionComponent, useState } from "react";
import type { YesNo } from "@/api";
import { SnapshotViewer } from "@/features/snapshot/components/snapshot-viewer";
import {
	buildSnapshotUrl,
	type SnapshotRes,
} from "@/features/snapshot/helpers/snapshot-url";

const SnapshotPage: FunctionComponent = () => {
	const [res, setRes] = useState<SnapshotRes>("high");
	const [watermark, setWatermark] = useState<YesNo>("yes");
	// null until the first Refresh: the page fetches exactly one frame on
	// open, like the stock UI — snapshots can reboot a camera under load,
	// so there is deliberately no auto-refresh or polling here.
	const [cacheBust, setCacheBust] = useState<number | null>(null);

	const src = buildSnapshotUrl(res, watermark, cacheBust);
	const refresh = () => setCacheBust(Date.now());

	return (
		<Stack gap="md">
			<Title order={2}>Snapshot</Title>
			<Card withBorder>
				<Stack gap="md">
					<Group justify="space-between">
						<Group gap="lg">
							<SegmentedControl<SnapshotRes>
								value={res}
								onChange={setRes}
								data={[
									{ label: "Low res", value: "low" },
									{ label: "High res", value: "high" },
								]}
							/>
							<Switch
								label="Watermark"
								checked={watermark === "yes"}
								onChange={(event) =>
									setWatermark(event.currentTarget.checked ? "yes" : "no")
								}
							/>
						</Group>
						<Button
							variant="default"
							leftSection={<ArrowClockwise size={16} />}
							onClick={refresh}
						>
							Refresh
						</Button>
					</Group>
					<SnapshotViewer key={src} src={src} onRetry={refresh} />
					<Text
						size="xs"
						c="dimmed"
						ff="monospace"
						style={{ wordBreak: "break-all" }}
					>
						{src}
					</Text>
				</Stack>
			</Card>
		</Stack>
	);
};

export const Route = createFileRoute("/snapshot")({
	component: SnapshotPage,
});
