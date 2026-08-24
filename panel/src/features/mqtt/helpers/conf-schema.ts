import { z } from "zod";

// set_configs.sh reads each body entry as `KEY=VALUE` and takes the value with
// `cut -d'=' -f2`, so everything after a second "=" is silently dropped — and
// the call still answers error=false.
export const EQUALS_MESSAGE =
	"Remove the = sign: the camera cuts values at the first one";

export const noEquals = (value: string) => !value.includes("=");

export const confValue = z.string().refine(noEquals, EQUALS_MESSAGE);

// z.object needs a typed shape and Object.fromEntries drops the literal key
// union — same trade-off as the record helpers.
export function sameShape<K extends string, S extends z.ZodType>(
	keys: readonly K[],
	schema: S,
): Record<K, S> {
	return Object.fromEntries(keys.map((key) => [key, schema])) as Record<K, S>;
}
