import {
	Button,
	Card,
	Group,
	Modal,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { type FunctionComponent, useState } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { TimelapseTable } from "@/features/timelapse/components/timelapse-table";
import { VideoModal } from "@/features/timelapse/components/video-modal";
import { useDeleteTimelapse } from "@/features/timelapse/hooks/use-delete-timelapse";
import { useTimelapseList } from "@/features/timelapse/hooks/use-timelapse-list";

export const TimelapsePage: FunctionComponent = () => {
	const { data, isPending, isError, refetch } = useTimelapseList();
	const deleteVideo = useDeleteTimelapse();
	const [playing, setPlaying] = useState<string | null>(null);
	const [pendingDelete, setPendingDelete] = useState<string | null>(null);

	const confirmDelete = () => {
		if (pendingDelete === null) {
			return;
		}
		deleteVideo.mutate(pendingDelete, {
			onSettled: () => setPendingDelete(null),
		});
	};

	return (
		<Stack gap="md">
			<Title order={2}>Timelapse</Title>
			<Text c="dimmed" size="sm">
				Time-lapse videos the camera has assembled on its SD card.
			</Text>
			<Card withBorder>
				{isPending ? (
					<Stack gap="sm">
						<Skeleton height={20} />
						<Skeleton height={32} />
						<Skeleton height={32} />
						<Skeleton height={32} />
					</Stack>
				) : isError ? (
					<ErrorState
						title="Could not list time-lapse videos"
						description="timelapse.sh?action=list did not answer with usable JSON. Check that the camera is reachable and the SD card is mounted — an .avi with an unexpected name in the timelapse folder also makes the script emit a malformed list."
						onRetry={() => refetch()}
					/>
				) : data.length === 0 ? (
					<Text size="sm" c="dimmed">
						No time-lapse videos on the SD card. Videos appear here only once
						Time-lapse is enabled on the System configuration page and a
						time-lapse video creation interval is set — the camera assembles the
						captured frames into an .avi on that schedule.
					</Text>
				) : (
					<TimelapseTable
						records={data}
						deletingFile={deleteVideo.isPending ? deleteVideo.variables : null}
						onPlay={setPlaying}
						onDelete={setPendingDelete}
					/>
				)}
			</Card>
			<VideoModal filename={playing} onClose={() => setPlaying(null)} />
			<Modal
				opened={pendingDelete !== null}
				onClose={() => setPendingDelete(null)}
				title="Delete this time-lapse video?"
				centered
			>
				<Stack gap="md">
					<Text size="sm">
						<Text span ff="monospace">
							{pendingDelete}
						</Text>{" "}
						will be erased from the camera's SD card. This cannot be undone.
					</Text>
					<Group justify="flex-end">
						<Button variant="default" onClick={() => setPendingDelete(null)}>
							Cancel
						</Button>
						<Button
							color="red"
							loading={deleteVideo.isPending}
							onClick={confirmDelete}
						>
							Delete
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Stack>
	);
};
