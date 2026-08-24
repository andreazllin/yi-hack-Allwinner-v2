import { useQuery } from "@tanstack/react-query";
import type { EventDirsResponse } from "@/api";
import { getEventDirsOptions } from "@/api/@tanstack/react-query.gen";

// eventsdir.sh prints both keys for every row it emits; the generated type
// marks them optional because the spec cannot express that. Rows missing either
// are dropped instead of rendered as a blank cell.
export type EventDir = {
	datetime: string;
	dirname: string;
};

// No assertCgiOk: eventsdir.sh has a single unconditional code path and never
// emits an `error` key at all. Its known trailing-comma bug (a non-14-char
// entry in /tmp/sd/record) produces malformed JSON, which fails to parse in
// axios and lands in the query's error state.
const selectEventDirs = (data: EventDirsResponse): EventDir[] =>
	data.records.flatMap((record) =>
		record.datetime && record.dirname
			? [{ datetime: record.datetime, dirname: record.dirname }]
			: [],
	);

export function useEventDirs() {
	return useQuery({
		...getEventDirsOptions(),
		select: selectEventDirs,
	});
}
