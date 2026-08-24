import type { ConfigFieldOption } from "@/features/mqtt/helpers/field-spec";

// The stock UI renders these as free text inputs, but the firmware compares
// them against fixed literals: "1" enables retain (anything else disables it)
// and QoS is used only when it is "0", "1" or "2".
export const RETAIN_OPTIONS: ConfigFieldOption[] = [
	{ value: "1", label: "1 — retain" },
	{ value: "0", label: "0 — do not retain" },
];

export const QOS_OPTIONS: ConfigFieldOption[] = [
	{ value: "0", label: "0 — at most once" },
	{ value: "1", label: "1 — at least once" },
	{ value: "2", label: "2 — exactly once" },
];

export const RETAIN_DESCRIPTION =
	"The broker keeps the last message on the topic and hands it to new subscribers.";

export const QOS_DESCRIPTION =
	"Delivery guarantee agreed between the camera and the broker.";
