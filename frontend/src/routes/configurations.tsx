import { createFileRoute } from "@tanstack/react-router";
import { type FunctionComponent, useMemo } from "react";
import { SystemConfigForm } from "@/features/configurations/components/system-config-form";
import { configurationCards } from "@/features/configurations/constants/configuration-cards";
import { configurationsSchema } from "@/features/configurations/helpers/schemas";
import { useGo2rtcSupport } from "@/features/configurations/hooks/use-go2rtc-support";
import { pageTitle } from "@/lib/page-title";

const ConfigurationsPage: FunctionComponent = () => {
	// Absent or unreadable status.json keeps the option, like the stock page:
	// it drops go2rtc only on an explicit "no".
	const { data: go2rtcSupported } = useGo2rtcSupport();
	const cards = useMemo(
		() => configurationCards({ go2rtcSupported: go2rtcSupported ?? true }),
		[go2rtcSupported],
	);

	return (
		<SystemConfigForm
			title="System Configuration"
			description="Services, hostname and timezone, cloud, snapshots and time-lapse, ports, credentials, crontab and debug — all stored in system.conf."
			cards={cards}
			surface="System configuration"
			schema={configurationsSchema}
		/>
	);
};

export const Route = createFileRoute("/configurations")({
	head: () => ({ meta: [{ title: pageTitle("System") }] }),
	component: ConfigurationsPage,
});
