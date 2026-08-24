import { createFileRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "react";
import { PagePlaceholder } from "@/components/page-placeholder";

const PtzPage: FunctionComponent = () => (
	<PagePlaceholder title="PTZ" description="Pan, tilt and preset control." />
);

export const Route = createFileRoute("/ptz")({
	component: PtzPage,
});
