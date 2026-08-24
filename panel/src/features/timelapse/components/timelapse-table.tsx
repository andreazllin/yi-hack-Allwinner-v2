import { ActionIcon, Anchor, Group, Table, Tooltip } from "@mantine/core";
import { DownloadSimple, Play, Trash } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";
import { timelapseFileUrl } from "@/features/timelapse/helpers/timelapse-url";
import type { TimelapseRecord } from "@/features/timelapse/hooks/use-timelapse-list";

type Props = {
	records: TimelapseRecord[];
	deletingFile: string | null;
	onPlay: (filename: string) => void;
	onDelete: (filename: string) => void;
};

export const TimelapseTable: FunctionComponent<Props> = ({
	records,
	deletingFile,
	onPlay,
	onDelete,
}) => (
	<Table.ScrollContainer minWidth={520}>
		<Table highlightOnHover verticalSpacing="sm">
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Video creation date</Table.Th>
					<Table.Th>Time</Table.Th>
					<Table.Th>File name</Table.Th>
					<Table.Th w={140}>Actions</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{records.map((record) => {
					const url = timelapseFileUrl(record.filename);
					return (
						<Table.Tr key={record.filename}>
							{/* timelapse.sh prints these already labelled ("Date: 2024-08-24",
							    "Time: 15:04:00"); shown verbatim rather than re-parsed. */}
							<Table.Td>{record.date ?? "—"}</Table.Td>
							<Table.Td>{record.time ?? "—"}</Table.Td>
							<Table.Td>
								<Anchor href={url} ff="monospace" size="sm" download>
									{record.filename}
								</Anchor>
							</Table.Td>
							<Table.Td>
								<Group gap="xs" wrap="nowrap">
									<Tooltip label="Play">
										<ActionIcon
											variant="light"
											aria-label={`Play ${record.filename}`}
											onClick={() => onPlay(record.filename)}
										>
											<Play size={16} />
										</ActionIcon>
									</Tooltip>
									<Tooltip label="Download">
										<ActionIcon
											component="a"
											href={url}
											download
											variant="light"
											aria-label={`Download ${record.filename}`}
										>
											<DownloadSimple size={16} />
										</ActionIcon>
									</Tooltip>
									<Tooltip label="Delete">
										<ActionIcon
											variant="light"
											color="red"
											aria-label={`Delete ${record.filename}`}
											loading={deletingFile === record.filename}
											onClick={() => onDelete(record.filename)}
										>
											<Trash size={16} />
										</ActionIcon>
									</Tooltip>
								</Group>
							</Table.Td>
						</Table.Tr>
					);
				})}
			</Table.Tbody>
		</Table>
	</Table.ScrollContainer>
);
