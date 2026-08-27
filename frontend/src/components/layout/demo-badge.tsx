import { Badge, Tooltip } from "@mantine/core";
import type { FunctionComponent } from "react";

// Visible marker for the GitHub Pages demo build. The UI exposes reboot,
// firmware upgrade and a delete that maps to `rm -rf` on real hardware, so it
// has to be obvious that nothing here is attached to a camera. Renders nothing
// in the firmware build.
export const DemoBadge: FunctionComponent = () => {
	if (import.meta.env.VITE_DEMO !== "1") {
		return null;
	}

	return (
		<Tooltip
			label="Emulated camera running in your browser. State resets on reload."
			multiline
			w={240}
		>
			<Badge color="yellow" variant="light" style={{ cursor: "help" }}>
				Demo — no hardware
			</Badge>
		</Tooltip>
	);
};
