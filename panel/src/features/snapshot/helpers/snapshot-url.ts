import type { GetSnapshotData, YesNo } from "@/api";

// Derived from the generated query type so the literal union stays tied to
// the spec instead of being restated by hand.
export type SnapshotRes = NonNullable<
	NonNullable<GetSnapshotData["query"]>["res"]
>;

// The generated SDK silently drops getSnapshot's binary content type and
// hardcodes responseType: "json", so the image is loaded with a plain
// <img src> instead of the SDK. The URL is same-origin in production; in
// dev the Vite server proxies /cgi-bin to the camera.
export function buildSnapshotUrl(
	res: SnapshotRes,
	watermark: YesNo,
	cacheBust: number | null,
): string {
	const params = new URLSearchParams({ res, watermark });
	if (cacheBust !== null) {
		// Browser-cache buster only: snapshot.sh ignores unknown params
		// silently (no else branch), so "_" never reaches the firmware logic.
		params.set("_", String(cacheBust));
	}
	return `/cgi-bin/snapshot.sh?${params.toString()}`;
}
