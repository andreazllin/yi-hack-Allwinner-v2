import {
	AspectRatio,
	Button,
	Card,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { ArrowClockwise } from "@phosphor-icons/react";
import { type FunctionComponent, useState } from "react";
import { ErrorState } from "@/components/data-state/error-state";

type LoadState = "loading" | "loaded" | "error";

export const PreviewCard: FunctionComponent = () => {
	// One frame per open, refreshed only on demand. The stock page re-fetches
	// the snapshot every second forever; upstream's README warns snapshots can
	// reboot the camera under load, so that loop is deliberately not copied.
	const [cacheBust, setCacheBust] = useState(() => Date.now());
	const [loadState, setLoadState] = useState<LoadState>("loading");

	// The generated SDK drops snapshot.sh's binary content type and forces
	// responseType json, so the image has to be loaded with a plain <img>.
	// snapshot.sh ignores unknown params (no else branch), so `_` never
	// reaches the firmware logic — it only defeats the browser cache.
	const src = `/cgi-bin/snapshot.sh?res=low&_=${cacheBust}`;

	const refresh = () => {
		setLoadState("loading");
		setCacheBust(Date.now());
	};

	return (
		<Card withBorder>
			<Stack gap="md">
				<Group justify="space-between" wrap="nowrap">
					<Stack gap={4}>
						<Title order={4}>Preview</Title>
						<Text size="sm" c="dimmed">
							One low-resolution frame, on demand.
						</Text>
					</Stack>
					<Button
						variant="default"
						leftSection={<ArrowClockwise size={16} />}
						onClick={refresh}
					>
						Refresh
					</Button>
				</Group>
				{loadState === "error" ? (
					<ErrorState
						title="Could not load the preview"
						description="The camera did not return a frame. It may be busy or rebooting — snapshots are heavy on this hardware. Wait a moment and retry."
						onRetry={refresh}
					/>
				) : (
					<>
						{loadState === "loading" && (
							<AspectRatio ratio={16 / 9}>
								<Skeleton height="100%" radius="sm" />
							</AspectRatio>
						)}
						{/* The img must stay mounted while loading or the request never fires. */}
						<img
							src={src}
							alt="Low-resolution camera preview"
							style={{
								width: "100%",
								display: loadState === "loaded" ? "block" : "none",
							}}
							onLoad={() => setLoadState("loaded")}
							onError={() => setLoadState("error")}
						/>
					</>
				)}
			</Stack>
		</Card>
	);
};
