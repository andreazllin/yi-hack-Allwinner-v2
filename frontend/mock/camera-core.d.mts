// Hand-written types for mock/camera-core.mjs. The mock is plain JS on purpose
// — it mirrors shell scripts, and `node mock/camera.mjs` has to run with no
// build step — but src/ is strict TypeScript, so the boundary is declared here.

export type MockReply = {
	networkError?: false;
	status: number;
	headers: Record<string, string>;
	body: string | Uint8Array;
	/** Milliseconds the emulated CGI script slept before answering. */
	slept: number;
};

/** The camera is "rebooting": no HTTP response exists, the connection dies. */
export type MockNetworkError = { networkError: true };

export type MockResponse = MockReply | MockNetworkError;

export function handle(request: {
	/** Path with query string, as the CGI sees it: "/cgi-bin/x.sh?a=b". */
	url: string;
	method?: string;
	body?: string;
}): Promise<MockResponse>;

export function describeRequest(
	method: string,
	url: string,
	response: MockResponse,
): string;
