import { HttpResponse, http } from "msw";
import { setupWorker } from "msw/browser";
import { describeRequest, handle } from "../../../mock/camera-core.mjs";

// Browser adapter for the mock camera: the same emulation the node server in
// mock/camera.mjs serves, running in a Service Worker so that the demo build
// needs no backend at all.
//
// A Service Worker (rather than an axios adapter) because four surfaces reach
// the camera without going through the generated client: the snapshot and PTZ
// previews (<img>), event thumbnails and recordings (<img>/<video>), and the
// config backup (<a href>). Only network-level interception covers those.

const respond = async ({ request }: { request: Request }) => {
	const url = new URL(request.url);
	// Undo the base prefix cameraPath() adds, so the core sees the firmware's
	// own paths and stays free of any deployment detail.
	const path = url.pathname.slice(url.pathname.search(/\/(cgi-bin|record)\//));
	// GET bodies do not exist; reading one throws.
	const body = request.method === "GET" ? "" : await request.text();

	const response = await handle({
		url: path + url.search,
		method: request.method,
		body,
	});
	console.debug(describeRequest(request.method, path + url.search, response));

	if (response.networkError) {
		// The camera is rebooting. HttpResponse.error() is a transport failure,
		// not a status code — which is what the frontend has to survive.
		return HttpResponse.error();
	}
	return new HttpResponse(response.body, {
		status: response.status,
		headers: response.headers,
	});
};

export async function startMockCamera(): Promise<void> {
	// A RegExp, not a glob: it matches on the full URL, so it is unaffected by
	// how many path segments the base prefix adds.
	const worker = setupWorker(http.all(/\/(cgi-bin|record)\//, respond));

	await worker.start({
		// Both the script and its scope have to sit under the deployed base, or
		// the worker cannot see the requests it exists to answer.
		serviceWorker: {
			url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
			options: { scope: import.meta.env.BASE_URL },
		},
		// Assets are real files; only /cgi-bin and /record are emulated.
		onUnhandledRequest: "bypass",
		// The mock logs its own line per request, in the node server's format.
		quiet: true,
	});
}
