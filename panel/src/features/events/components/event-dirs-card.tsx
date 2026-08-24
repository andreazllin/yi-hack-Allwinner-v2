import {
	ActionIcon,
	Anchor,
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
import { Trash } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { type FunctionComponent, useState } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { useDeleteEventDir } from "@/features/events/hooks/use-delete-event-dir";
import { useEventDirs } from "@/features/events/hooks/use-event-dirs";

const SKELETON_ROWS = ["a", "b", "c", "d"];

export const EventDirsCard: FunctionComponent = () => {
	const { data, isPending, isError, refetch } = useEventDirs();
	const deleteDir = useDeleteEventDir();
	// A single nullable target instead of useDisclosure plus a target: the modal
	// only exists to confirm one specific row, and two states could disagree
	// about which row that is.
	const [dirToDelete, setDirToDelete] = useState<string | null>(null);

	const confirmDelete = () => {
		if (dirToDelete === null) {
			return;
		}
		deleteDir.mutate(dirToDelete, {
			onSettled: () => setDirToDelete(null),
		});
	};

	return (
		<Card withBorder>
			<Stack gap="sm">
				<Group justify="space-between">
					<Title order={4}>Recording directories</Title>
					{data && data.length > 0 && (
						<Text size="sm" c="dimmed">
							{data.length === 1 ? "1 directory" : `${data.length} directories`}
						</Text>
					)}
				</Group>

				{isError && (
					<ErrorState
						title="Could not list the recordings"
						description="The camera did not return a usable directory list. It may be busy, or its listing may be malformed — eventsdir.sh prints invalid JSON when /tmp/sd/record holds an entry it does not recognise."
						onRetry={() => refetch()}
					/>
				)}

				{!isError && !isPending && data.length === 0 && (
					<Stack gap={4}>
						<Text size="sm" fw={500}>
							No recordings yet
						</Text>
						<Text size="sm" c="dimmed">
							One directory appears here for every hour in which the camera
							saved a motion event to the SD card. Nothing is recorded while
							"Save video on motion" is off in Camera Settings.
						</Text>
					</Stack>
				)}

				{!isError && (isPending || data.length > 0) && (
					<Table.ScrollContainer minWidth={420}>
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Date &amp; time</Table.Th>
									<Table.Th>Directory name</Table.Th>
									<Table.Th w={60} />
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{isPending
									? SKELETON_ROWS.map((row) => (
											<Table.Tr key={row}>
												<Table.Td>
													<Skeleton height={16} width={200} />
												</Table.Td>
												<Table.Td>
													<Skeleton height={16} width={120} />
												</Table.Td>
												<Table.Td>
													<Skeleton height={16} width={24} />
												</Table.Td>
											</Table.Tr>
										))
									: data.map((dir) => (
											<Table.Tr key={dir.dirname}>
												{/* Printed by the camera, which already decided how to
												    read the directory name (EVENTS_TIME) — shown verbatim,
												    with no timezone maths on this side. */}
												<Table.Td>{dir.datetime}</Table.Td>
												<Table.Td>
													{/* renderRoot, not component={Link}: Mantine's polymorphic
													    props drop the router's typing of `params`. */}
													<Anchor
														ff="monospace"
														size="sm"
														renderRoot={(props) => (
															<Link
																to="/events/$dir"
																params={{ dir: dir.dirname }}
																{...props}
															/>
														)}
													>
														{dir.dirname}
													</Anchor>
												</Table.Td>
												<Table.Td>
													<ActionIcon
														variant="subtle"
														color="red"
														aria-label={`Delete ${dir.dirname}`}
														onClick={() => setDirToDelete(dir.dirname)}
													>
														<Trash size={16} />
													</ActionIcon>
												</Table.Td>
											</Table.Tr>
										))}
							</Table.Tbody>
						</Table>
					</Table.ScrollContainer>
				)}
			</Stack>

			<Modal
				opened={dirToDelete !== null}
				onClose={() => setDirToDelete(null)}
				title="Delete recording directory"
			>
				<Stack gap="md">
					<Text size="sm">
						Every recording and thumbnail inside{" "}
						<Text span ff="monospace">
							{dirToDelete}
						</Text>{" "}
						will be deleted from the SD card. This cannot be undone.
					</Text>
					<Group justify="flex-end">
						<Button variant="default" onClick={() => setDirToDelete(null)}>
							Cancel
						</Button>
						<Button
							color="red"
							loading={deleteDir.isPending}
							onClick={confirmDelete}
						>
							Delete directory
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Card>
	);
};
