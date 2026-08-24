import {
	ActionIcon,
	useComputedColorScheme,
	useMantineColorScheme,
} from "@mantine/core";
import { Moon, Sun } from "@phosphor-icons/react";
import type { FunctionComponent } from "react";

export const ColorSchemeToggle: FunctionComponent = () => {
	const { setColorScheme } = useMantineColorScheme();
	const computed = useComputedColorScheme("light");

	return (
		<ActionIcon
			variant="default"
			size="lg"
			aria-label="Toggle color scheme"
			onClick={() => setColorScheme(computed === "light" ? "dark" : "light")}
		>
			{computed === "light" ? <Moon size={18} /> : <Sun size={18} />}
		</ActionIcon>
	);
};
