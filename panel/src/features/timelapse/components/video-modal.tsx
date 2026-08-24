import { Anchor, Modal, Stack, Text } from "@mantine/core";
import { type FunctionComponent, useState } from "react";
import { timelapseFileUrl } from "@/features/timelapse/helpers/timelapse-url";

type Props = {
	filename: string | null;
	onClose: () => void;
};

export const VideoModal: FunctionComponent<Props> = ({ filename, onClose }) => {
	// Keyed by filename rather than a boolean, so opening another video clears
	// the previous failure without an effect.
	const [failedFile, setFailedFile] = useState<string | null>(null);
	const decodeFailed = filename !== null && failedFile === filename;

	return (
		<Modal
			opened={filename !== null}
			onClose={onClose}
			title={filename ?? "Time-lapse video"}
			size="lg"
			centered
		>
			<Stack gap="sm">
				{filename !== null && (
					// The camera writes MJPEG in an AVI container, which most browsers
					// cannot decode (the stock UI sliced the JPEG frames out by hand).
					// biome-ignore lint/a11y/useMediaCaption: camera recordings have no caption track
					<video
						key={filename}
						src={timelapseFileUrl(filename)}
						controls
						style={{ width: "100%", background: "black" }}
						onError={() => setFailedFile(filename)}
					/>
				)}
				{decodeFailed && filename !== null ? (
					<Text size="sm" c="red">
						This browser cannot decode the file (MJPEG in an AVI container).{" "}
						<Anchor href={timelapseFileUrl(filename)} download>
							Download it
						</Anchor>{" "}
						and play it locally instead.
					</Text>
				) : (
					<Text size="sm" c="dimmed">
						The whole file streams off the SD card. MJPEG-in-AVI playback
						depends on the browser — download the file if nothing appears.
					</Text>
				)}
			</Stack>
		</Modal>
	);
};
