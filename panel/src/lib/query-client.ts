import { QueryClient } from "@tanstack/react-query";

// Every request to /cgi-bin forks a shell on a slow SoC that upstream's own
// README warns can reboot under load — several TanStack Query defaults are
// actively wrong against this backend.
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// A failed request here is usually a rejected query string or a
			// malformed response — a retry fixes neither, and a retried write
			// re-applies settings at ~7.5s per attempt.
			retry: false,
			// Focus refetches would re-poll the camera on every alt-tab and
			// silently replace config data underneath an in-progress edit.
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			staleTime: 30_000,
		},
		// Mutations already default to no retries — leave that alone.
	},
});
