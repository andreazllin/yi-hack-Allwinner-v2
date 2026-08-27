import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
// latin-only subsets: geist-mono's default entrypoint also ships Cyrillic,
// Vietnamese and symbol faces this UI never renders, and they would sit on
// the camera's SD card and re-download on every load (BusyBox sends no
// cache headers).
import "@fontsource/geist-sans/latin-400.css";
import "@fontsource/geist-sans/latin-500.css";
import "@fontsource/geist-sans/latin-600.css";
import "@fontsource/geist-sans/latin-700.css";
import "@fontsource/geist-mono/latin-400.css";
import "@fontsource/geist-mono/latin-600.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import {
	createHashHistory,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Side-effect import: configures the generated API client (same-origin
// baseURL, request concurrency cap, malformed-JSON detection). Must run
// before any query fires.
import "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { theme } from "@/lib/theme";
import { routeTree } from "./routeTree.gen";

// Hash history: BusyBox httpd has no rewrite rules, so a deep link like
// /frontend/events/x would 404 — there is no file at that path.
// defaultPreload stays false: on this API GET mutates (reboot, delete, PTZ).
const router = createRouter({
	routeTree,
	history: createHashHistory(),
	defaultPreload: false,
	context: { queryClient },
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Demo build only (GitHub Pages): the camera is emulated by a Service Worker,
// which must be in control before the first query fires — hence the await here
// rather than inside a component. VITE_DEMO is replaced at build time, so the
// firmware bundle drops this branch and never pulls msw in.
if (import.meta.env.VITE_DEMO === "1") {
	const { startMockCamera } = await import("@/lib/mock/start");
	await startMockCamera();
}

const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("#root element missing from index.html");
}

createRoot(rootElement).render(
	<StrictMode>
		<MantineProvider theme={theme} defaultColorScheme="auto">
			<Notifications position="top-right" />
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</MantineProvider>
	</StrictMode>,
);
