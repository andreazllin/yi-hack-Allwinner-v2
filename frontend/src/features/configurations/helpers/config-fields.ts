import type { ReactNode } from "react";
import type { SystemConf } from "@/api";

// Field keys are checked against the generated SystemConf shape on purpose:
// set_configs.sh accepts an unknown key with error=false and writes nothing,
// so a typo would be invisible at runtime. Here it fails the build instead.
export type SystemConfKey = keyof SystemConf;

type FieldBase = {
	key: SystemConfKey;
	label: string;
	description?: ReactNode;
};

export type FieldSpec =
	| (FieldBase & { kind: "switch" | "text" | "password" })
	// Owns its own option list (the stock timezone table), so it carries none.
	| (FieldBase & { kind: "timezone" })
	| (FieldBase & { kind: "textarea"; rows: number })
	| (FieldBase & {
			kind: "select";
			options: { value: string; label: string }[];
	  });

export type CardSpec = {
	title: string;
	fields: FieldSpec[];
};

// A .conf file is a flat KEY=value text file: get_configs returns it as an
// open string map and set_configs takes the same shape back. Form values keep
// that shape, so ports and intervals stay strings end to end — the firmware
// never sees a number or a boolean.
export type ConfigFormValues = Record<string, string>;

export function configFormValues(
	cards: CardSpec[],
	conf: Record<string, string>,
): ConfigFormValues {
	return Object.fromEntries(
		cards.flatMap((card) =>
			card.fields.map((field): [string, string] => [
				field.key,
				// Same rule as the stock UI: a switch is on for the exact string
				// "yes" and nothing else. "" covers keys a firmware predating the
				// option does not have in its conf at all.
				field.kind === "switch"
					? conf[field.key] === "yes"
						? "yes"
						: "no"
					: (conf[field.key] ?? ""),
			]),
		),
	);
}
