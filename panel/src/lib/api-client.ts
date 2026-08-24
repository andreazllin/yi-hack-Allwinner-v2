import { client } from "@/api/client.gen";

// Same-origin: in production the panel is served by the camera itself, and in
// dev the Vite proxy maps /cgi-bin and /record to CAM_HOST (vite.config.ts).
client.setConfig({ baseURL: "" });

// Concurrency cap. TanStack Query has no global limit, and every request to
// /cgi-bin forks a shell on a slow SoC — upstream's README warns the camera
// can reboot under load. Two in flight is plenty for a settings panel; the
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
		return response;
	},
	(error) => {
		release();
		return Promise.reject(error);
	},
);
