import { AspectRatio, Skeleton } from "@mantine/core";
import { type FunctionComponent, useState } from "react";
import { ErrorState } from "@/components/data-state/error-state";

type Props = {
	src: string;
	onRetry: () => void;
};

type LoadState = "loading" | "loaded" | "error";

// Mounted with key={src} by the page, so any URL change remounts it and the
// load state resets to "loading" without effect plumbing.
export const SnapshotViewer: FunctionComponent<Props> = ({ src, onRetry }) => {
	const [loadState, setLoadState] = useState<LoadState>("loading");

	if (loadState === "error") {
		return (
			<ErrorState
				title="Could not load the snapshot"
				description="The camera did not return an image — it may be busy or rebooting (snapshots are heavy on this hardware). Wait a moment and retry."
				onRetry={onRetry}
			/>
		);
	}

	return (
		<>
			{loadState === "loading" && (
				<AspectRatio ratio={16 / 9}>
					<Skeleton height="100%" radius="sm" />
				</AspectRatio>
			)}
			{/* The img must stay mounted while loading or the request never fires. */}
			<img
				src={src}
				alt="Camera snapshot"
				style={{
					width: "100%",
					display: loadState === "loaded" ? "block" : "none",
				}}
				onLoad={() => setLoadState("loaded")}
				onError={() => setLoadState("error")}
			/>
		</>
	);
};
