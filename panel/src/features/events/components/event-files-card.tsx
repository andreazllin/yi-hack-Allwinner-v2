import {
	ActionIcon,
	Button,
	Card,
	Group,
	Modal,
	Skeleton,
	Stack,
	Table,
	Text,
	Title,
} from "@mantine/core";
import { DownloadSimple, Play, Trash } from "@phosphor-icons/react";
import { type FunctionComponent, useState } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { buildRecordUrl } from "@/features/events/helpers/event-paths";
import { useDeleteEventFile } from "@/features/events/hooks/use-delete-event-file";
import {
	type EventFile,
	useEventFiles,
} from "@/features/events/hooks/use-event-files";

type Props = {
	dir: string;
};

const SKELETON_ROWS = ["a", "b", "c"];

export const EventFilesCard: FunctionComponent<Props> = ({ dir }) => {
	const { data, isPending, isError, refetch } = useEventFiles(dir);
	const deleteFile = useDeleteEventFile();
	const [fileToPlay, setFileToPlay] = useState<EventFile | null>(null);
	const [fileToDelete, setFileToDelete] = useState<EventFile | null>(null);

	const confirmDelete = () => {
		if (fileToDelete === null) {
			return;
		}
		deleteFile.mutate(
			{ dir, filename: fileToDelete.filename },
			{ onSettled: () => setFileToDelete(null) },
		);
	};

	return (
		<Card withBorder>
			<Stack gap="sm">
				<Group justify="space-between">
					{/* The date is derived by the camera from the directory name under
					    its own EVENTS_TIME setting — shown verbatim. */}
					<Title order={4}>{data?.date || "Recordings"}</Title>
					{data && data.files.length > 0 && (
						<Text size="sm" c="dimmed">
							{data.files.length === 1
								? "1 recording"
								: `${data.files.length} recordings`}
						</Text>
					)}
				</Group>

				{isError && (
					<ErrorState
						title="Could not list this directory"
						description="The camera refused the listing or returned an unusable answer. The directory may have been deleted since the list was loaded."
						onRetry={() => refetch()}
					/>
				)}

				{!isError && data?.files.length === 0 && (
					<Stack gap={4}>
						<Text size="sm" fw={500}>
							No recordings in this directory
						</Text>
						<Text size="sm" c="dimmed">
							The videos may already have been deleted, or auto video cleaning
							removed them to free space on the SD card.
						</Text>
					</Stack>
				)}

				{!isError && (isPending || (data && data.files.length > 0)) && (
					<Table.ScrollContainer minWidth={520}>
						<Table striped highlightOnHover verticalSpacing="sm">
							<Table.Thead>
								<Table.Tr>
									<Table.Th w={100}>Time</Table.Th>
									<Table.Th w={120}>Thumbnail</Table.Th>
									<Table.Th>File name</Table.Th>
									<Table.Th w={200} />
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{isPending || !data
									? SKELETON_ROWS.map((row) => (
											<Table.Tr key={row}>
												<Table.Td>
													<Skeleton height={16} width={60} />
												</Table.Td>
												<Table.Td>
													<Skeleton height={56} width={100} />
												</Table.Td>
												<Table.Td>
													<Skeleton height={16} width={120} />
												</Table.Td>
												<Table.Td>
													<Skeleton height={28} width={180} />
												</Table.Td>
											</Table.Tr>
										))
									: data.files.map((file) => (
											<Table.Tr key={file.filename}>
												<Table.Td>{file.time}</Table.Td>
												<Table.Td>
													{file.thumbfilename === "" ? (
														<Text size="sm" c="dimmed">
															No preview
														</Text>
													) : (
														<img
															src={buildRecordUrl(dir, file.thumbfilename)}
															alt={`Thumbnail of ${file.filename}`}
															width={100}
															loading="lazy"
															style={{ display: "block", borderRadius: 4 }}
														/>
													)}
												</Table.Td>
												<Table.Td ff="monospace">{file.filename}</Table.Td>
												<Table.Td>
													<Group gap="xs" wrap="nowrap" justify="flex-end">
														<Button
															size="xs"
															variant="light"
															leftSection={<Play size={14} />}
															onClick={() => setFileToPlay(file)}
														>
															Play
														</Button>
														<ActionIcon
															component="a"
															href={buildRecordUrl(dir, file.filename)}
															download={file.filename}
															variant="subtle"
															aria-label={`Download ${file.filename}`}
														>
															<DownloadSimple size={16} />
														</ActionIcon>
														<ActionIcon
															variant="subtle"
															color="red"
															aria-label={`Delete ${file.filename}`}
															onClick={() => setFileToDelete(file)}
														>
															<Trash size={16} />
														</ActionIcon>
													</Group>
												</Table.Td>
											</Table.Tr>
										))}
							</Table.Tbody>
						</Table>
					</Table.ScrollContainer>
				)}
			</Stack>

			<Modal
				opened={fileToPlay !== null}
				onClose={() => setFileToPlay(null)}
				title={fileToPlay?.filename}
				size="lg"
			>
				{fileToPlay && (
					// biome-ignore lint/a11y/useMediaCaption: camera recordings have no caption track
					<video
						controls
						autoPlay
						src={buildRecordUrl(dir, fileToPlay.filename)}
						style={{ width: "100%" }}
					/>
				)}
			</Modal>

			<Modal
				opened={fileToDelete !== null}
				onClose={() => setFileToDelete(null)}
				title="Delete recording"
			>
				<Stack gap="md">
					<Text size="sm">
						<Text span ff="monospace">
							{fileToDelete?.filename}
						</Text>{" "}
						and its thumbnail will be deleted from the SD card. This cannot be
						undone.
					</Text>
					<Group justify="flex-end">
						<Button variant="default" onClick={() => setFileToDelete(null)}>
							Cancel
						</Button>
						<Button
							color="red"
							loading={deleteFile.isPending}
							onClick={confirmDelete}
						>
							Delete recording
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Card>
	);
};
