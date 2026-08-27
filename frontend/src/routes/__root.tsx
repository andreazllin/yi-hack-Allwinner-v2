import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
} from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";

type RouterContext = {
	queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	// Fallback for any route that sets no title of its own, and the source of
	// the title while "/" is still redirecting to /status.
	head: () => ({ meta: [{ title: "yi-hack frontend" }] }),
	component: () => (
		<>
			{/* Writes the matched route's <title> into the document head. The one
			    in index.html is deliberately left in place as the title before
			    any JavaScript runs, which on the camera is a visible moment. That
			    leaves two <title> elements: React hoists this one to the top of
			    <head>, and the first one wins per the HTML spec, so this one is
			    what the tab shows. If that order ever changes the tab falls back
			    to "yi-hack frontend" everywhere — wrong, but harmless. */}
			<HeadContent />
			<AppLayout>
				<Outlet />
			</AppLayout>
		</>
	),
});
