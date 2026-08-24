import { Badge, Group, SimpleGrid, Stack, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { ErrorState } from "@/components/data-state/error-state";
import { InfoCard } from "@/features/status/components/info-card";
import { StreamLinksCard } from "@/features/status/components/stream-links-card";
import {
	formatMemory,
	formatUptime,
	wifiStrengthPercent,
} from "@/features/status/helpers/format";
import { useStatus } from "@/features/status/hooks/use-status";
import { describeQueryError } from "@/lib/cgi";

const StatusPage: FunctionComponent = () => {
	const { data, isPending, isError, error, refetch } = useStatus();

	if (isError) {
		return (
			<Stack gap="md">
				<Title order={2}>Status</Title>
				<ErrorState
					{...describeQueryError(error, "status")}
					onRetry={() => refetch()}
				/>
			</Stack>
		);
	}

	const strength = data?.wlan_strength
		? wifiStrengthPercent(data.wlan_strength)
		: null;

	return (
		<Stack gap="md">
			<Group justify="space-between">
				<Title order={2}>Status</Title>
				{data?.hostname && <Badge variant="light">{data.hostname}</Badge>}
			</Group>
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
				<InfoCard
					title="System"
					pending={isPending}
					rows={[
						{ label: "Firmware version", value: data?.fw_version },
						{ label: "Home version", value: data?.home_version },
						{ label: "Model", value: data?.model_suffix },
						{ label: "Serial number", value: data?.serial_number },
						{ label: "Local time", value: data?.local_time },
						{
							label: "Uptime",
							value: data?.uptime ? formatUptime(data.uptime) : undefined,
						},
						{ label: "Load average", value: data?.load_avg },
						{
							label: "Memory (free/total)",
							value:
								data?.free_memory && data?.total_memory
									? formatMemory(data.free_memory, data.total_memory)
									: undefined,
						},
						{ label: "Free SD space", value: data?.free_sd },
						{ label: "PTZ support", value: data?.ptz },
						{ label: "go2rtc", value: data?.go2rtc },
					]}
				/>
				<InfoCard
					title="Network"
					pending={isPending}
					rows={[
						{ label: "IP address", value: data?.local_ip },
						{ label: "Netmask", value: data?.netmask },
						{ label: "Gateway", value: data?.gateway },
						{ label: "MAC address", value: data?.mac_addr },
						{ label: "WiFi ESSID", value: data?.wlan_essid },
						{
							label: "WiFi strength",
							value: strength === null ? undefined : `${strength}%`,
						},
					]}
				/>
			</SimpleGrid>
			<StreamLinksCard />
		</Stack>
	);
};

export const Route = createFileRoute("/status")({
	component: StatusPage,
});
