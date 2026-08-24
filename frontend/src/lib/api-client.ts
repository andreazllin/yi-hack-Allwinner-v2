import { client } from "@/api/client.gen";

// Same-origin: in production the frontend is served by the camera itself, and in
// dev the Vite proxy maps /cgi-bin and /record to CAM_HOST (vite.config.ts).
client.setConfig({ baseURL: "" });

// Concurrency cap. TanStack Query has no global limit, and every request to
// /cgi-bin forks a shell on a slow SoC — upstream's README warns the camera
// can reboot under load. Two in flight is plenty for a settings frontend; the
// cap holds no matter what the query layer decides to do.
const MAX_IN_FLIGHT = 2;
let inFlight = 0;
const waiters: (() => void)[] = [];

const acquire = () =>
	new Promise<void>((resolve) => {
		if (inFlight < MAX_IN_FLIGHT) {
			inFlight += 1;
			resolve();
		} else {
			waiters.push(() => {
				inFlight += 1;
				resolve();
			});
		}
	});

const release = () => {
	inFlight -= 1;
	waiters.shift()?.();
};

client.instance.interceptors.request.use(async (config) => {
	await acquire();
	return config;
});

client.instance.interceptors.response.use(
	(response) => {
		release();
		assertParsedJson(response);
		return response;
	},
	(error) => {
		release();
		return Promise.reject(error);
	},
);

// Raised when a response claimed to be JSON but did not parse.
export class MalformedResponseError extends Error {
	constructor(url: string | undefined) {
		super(
			`The camera returned a malformed JSON response${url ? ` from ${url}` : ""}. ` +
				"This usually means a value contains a character the firmware does not " +
				"escape — an SSID or hostname with a quote in it will break status.json.",
		);
		this.name = "MalformedResponseError";
	}
}

// The CGI scripts print JSON with unescaped printf, so a quote inside an SSID
// or hostname yields an invalid document. axios's default transform swallows
// the SyntaxError and hands back the raw string, which then reads as a body
// where every field is undefined — indistinguishable from a camera that
// reported nothing. Turn it back into a distinct, reportable failure so the
// surface shows an error instead of a grid of blanks.
function assertParsedJson(response: {
	data: unknown;
	config: { url?: string; responseType?: string };
	headers: unknown;
}): void {
	if (typeof response.data !== "string") {
		return;
	}
	// Only JSON responses are expected to be objects. Binary and text
	// endpoints (snapshots, config backups) legitimately return strings.
	const contentType = String(
		(response.headers as Record<string, unknown> | undefined)?.[
			"content-type"
		] ?? "",
	);
	if (!contentType.includes("application/json")) {
		return;
	}
	throw new MalformedResponseError(response.config.url);
}
