import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";

type RouterContext = {
	queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	component: () => (
		<AppLayout>
			<Outlet />
		</AppLayout>
	),
});
