import {
	AppShell,
	Burger,
	Group,
	ScrollArea,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { FunctionComponent, ReactNode } from "react";
import { ColorSchemeToggle } from "@/components/layout/color-scheme-toggle";
import { RouterNavLink } from "@/components/layout/router-nav-link";
import { NAV_SECTIONS } from "@/constants/navigation";

type Props = {
	children: ReactNode;
};

export const AppLayout: FunctionComponent<Props> = ({ children }) => {
	const [opened, { toggle, close }] = useDisclosure();

	return (
		<AppShell
			layout="alt"
			header={{ height: 56 }}
			navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
			padding="md"
		>
			<AppShell.Header>
				<Group h="100%" px="md" justify="space-between">
					<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
					<ColorSchemeToggle />
				</Group>
			</AppShell.Header>
			<AppShell.Navbar>
				<AppShell.Section p="md">
					<Group justify="space-between" wrap="nowrap">
						<div>
							<Title order={4}>yi-hack</Title>
							<Text size="xs" c="dimmed">
								Allwinner-v2 frontend
							</Text>
						</div>
						<Burger opened={opened} onClick={close} hiddenFrom="sm" size="sm" />
					</Group>
				</AppShell.Section>
				<AppShell.Section grow component={ScrollArea} px="xs" pb="md">
					<Stack gap="md">
						{NAV_SECTIONS.map((section) => (
							<div key={section.label}>
								<Text
									size="xs"
									fw={600}
									c="dimmed"
									tt="uppercase"
									px="sm"
									pb={4}
								>
									{section.label}
								</Text>
								{section.items.map((item) => (
									<RouterNavLink
										key={item.to}
										to={item.to}
										label={item.label}
										leftSection={<item.icon size={18} />}
										// /events must stay highlighted on /events/$dir
										activeOptions={{ exact: item.to !== "/events" }}
										onClick={close}
									/>
								))}
							</div>
						))}
					</Stack>
				</AppShell.Section>
			</AppShell.Navbar>
			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
};
