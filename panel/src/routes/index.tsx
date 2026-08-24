import { createFileRoute, redirect } from "@tanstack/react-router";

// The stock UI opens on the status page; mirror that.
export const Route = createFileRoute("/")({
	beforeLoad: () => {
		throw redirect({ to: "/status" });
	},
});
