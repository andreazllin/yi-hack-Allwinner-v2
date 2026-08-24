import { createTheme } from "@mantine/core";

// Geist is self-hosted via @fontsource (imported in main.tsx) — the frontend is
// served from the camera and must work with no internet access, so no CDN.
export const theme = createTheme({
	fontFamily: "'Geist Sans', system-ui, sans-serif",
	fontFamilyMonospace: "'Geist Mono', ui-monospace, monospace",
	headings: {
		fontFamily: "'Geist Sans', system-ui, sans-serif",
		fontWeight: "600",
	},
});
