import { useQuery } from "@tanstack/react-query";
import type { TimelapseListResponse } from "@/api";
import { timelapseOptions } from "@/api/@tanstack/react-query.gen";
import { assertCgiOk } from "@/lib/cgi";

type ListedRecord = NonNullable<TimelapseListResponse["records"]>[number];

// Every field of the generated record is optional, but a row without a
// filename can neither be played nor deleted — narrow here so no call site
// has to guard, and drop such rows in the select below.
export type TimelapseRecord = Omit<ListedRecord, "filename"> & {
	filename: string;
};

// timelapse.sh?action=list is a pure read — only action=delete mutates —
// so handing the generated queryOptions factory to useQuery is safe here.
export function useTimelapseList() {
	return useQuery({
		...timelapseOptions({ query: { action: "list" } }),
		select: (data): TimelapseRecord[] => {
			const body = assertCgiOk(data);
			if (!("records" in body)) {
				return [];
			}
			return (body.records ?? []).filter(
				(record): record is TimelapseRecord =>
					typeof record.filename === "string",
			);
		},
	});
}
