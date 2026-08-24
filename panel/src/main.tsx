import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-sans/700.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/600.css";

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
import { queryClient } from "@/lib/query-client";
import { theme } from "@/lib/theme";
import { routeTree } from "./routeTree.gen";

// Hash history: BusyBox httpd has no rewrite rules, so a deep link like
// /panel/events/x would 404 — there is no file at that path.
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
