// load.sh exits with an EMPTY body when CONTENT_LENGTH exceeds 10000 bytes,
// and CONTENT_LENGTH covers the whole multipart body — boundary lines and part
// headers included — so the archive itself has to stay under that by a margin.
const MAX_REQUEST_BYTES = 10_000;
const MULTIPART_OVERHEAD_BYTES = 512;
export const MAX_CONFIG_ARCHIVE_BYTES =
	MAX_REQUEST_BYTES - MULTIPART_OVERHEAD_BYTES;

export type RestoreResult = {
	ok: boolean;
	message: string;
};

// load.sh answers HTTP 200 text/html on every path — "Upload completed
// successfully, restart your camera" or "Upload failed" — so the body text is
// the only success signal there is.
export function parseRestoreResult(body: string): RestoreResult {
	// The axios client substitutes {} for a nullish body, so anything that is
	// not a string is treated as the empty (rejected) case.
	const message = typeof body === "string" ? body.trim() : "";
	if (message.length === 0) {
		return {
			ok: false,
			message:
				"The camera answered with an empty body, which is how load.sh rejects an upload it will not read (usually one over its 10000-byte limit).",
		};
	}
	return { ok: message.toLowerCase().startsWith("upload completed"), message };
}
