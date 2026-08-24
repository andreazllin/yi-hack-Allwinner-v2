import { useQuery } from "@tanstack/react-query";
import type { EventFilesResponse } from "@/api";
import { getEventFilesOptions } from "@/api/@tanstack/react-query.gen";
import { isEventDirName } from "@/features/events/helpers/event-paths";
import { assertCgiOk } from "@/lib/cgi";

// eventsfile.sh prints all three keys for every row it emits. thumbfilename is
// deliberately "" when the sibling .jpg is missing or zero-length.
export type EventFile = {
	time: string;
	filename: string;
	thumbfilename: string;
};

export type EventFileList = {
	date: string;
	files: EventFile[];
};

const selectEventFiles = (data: EventFilesResponse): EventFileList => {
	// A missing or rejected dirname answers HTTP 200 with {"error":"true"}.
	const body = assertCgiOk(data);
	return {
		date: body.date ?? "",
		files: (body.records ?? []).flatMap((record) =>
			record.time && record.filename
				? [
						{
							time: record.time,
							filename: record.filename,
							thumbfilename: record.thumbfilename ?? "",
						},
					]
				: [],
		),
	};
};

export function useEventFiles(dir: string) {
	return useQuery({
		...getEventFilesOptions({ query: { dirname: dir } }),
		// dirname reaches `ls -r /tmp/sd/record/$DIR` unquoted (its format check
		// is dead code) and an empty value lists the record root, so a name that
		// the camera could not have produced is never sent. The page renders an
		// explanation for that case instead.
		enabled: isEventDirName(dir),
		select: selectEventFiles,
	});
}
