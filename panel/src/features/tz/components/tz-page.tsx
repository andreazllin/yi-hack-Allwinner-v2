import {
	Anchor,
	Card,
	Stack,
	Table,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { type FunctionComponent, useMemo, useState } from "react";
import { TIMEZONES } from "@/features/tz/constants/timezones";

export const TzPage: FunctionComponent = () => {
	const [filter, setFilter] = useState("");
	const query = filter.trim().toLowerCase();

	const rows = useMemo(
		() =>
			query === ""
				? TIMEZONES
				: TIMEZONES.filter((entry) =>
						entry.location.toLowerCase().includes(query),
					),
		[query],
	);

	return (
		<Stack gap="md">
			<Title order={2}>Time Zone</Title>
			<Text size="sm" c="dimmed">
				Reference table only — nothing here is sent to the camera. Copy the TZ
				string of your location into the Timezone field on the{" "}
				<Anchor component={Link} to="/configurations">
					System configuration
				</Anchor>{" "}
				page.
			</Text>
			<Card withBorder>
				<Stack gap="md">
					<TextInput
						label="Filter by location"
						placeholder="Europe/Rome"
						leftSection={<MagnifyingGlass size={16} />}
						value={filter}
						onChange={(event) => setFilter(event.currentTarget.value)}
					/>
					<Text size="xs" c="dimmed">
						{rows.length} of {TIMEZONES.length} locations
					</Text>
					{rows.length === 0 ? (
						<Text size="sm">
							No location matches “{filter}”. The table lists IANA-style names
							such as “Europe/Rome” or “America/New York”; try a shorter
							fragment.
						</Text>
					) : (
						<Table striped highlightOnHover stickyHeader>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Location</Table.Th>
									<Table.Th>TZ string</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{rows.map((entry) => (
									<Table.Tr key={entry.location}>
										<Table.Td>{entry.location}</Table.Td>
										<Table.Td ff="monospace">{entry.tz}</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					)}
				</Stack>
			</Card>
		</Stack>
	);
};
