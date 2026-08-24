import path from "node:path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type ProxyOptions } from "vite";

export default defineConfig(({ mode }) => {
	// Server-only env (CAM_*): loaded with an empty prefix filter so nothing
	// here is ever exposed to the client bundle (only VITE_-prefixed vars are).
	// The camera's BusyBox httpd sends no CORS headers and has no OPTIONS
	// handler, so the browser cannot call it cross-origin from localhost —
	// the dev proxy is a property of the server, not a convenience.
	const env = loadEnv(mode, process.cwd(), "");
	const camHost = env.CAM_HOST ?? "192.168.10.211";
	const target = camHost.startsWith("http") ? camHost : `http://${camHost}`;

	const camProxy: ProxyOptions = {
		target,
		changeOrigin: true,
		// Basic auth is injected by the proxy; credentials never enter the bundle.
		...(env.CAM_USER ? { auth: `${env.CAM_USER}:${env.CAM_PASS ?? ""}` } : {}),
	};

	return {
		// Absolute base: the panel is deployed to /tmp/sd/yi-hack/www/panel/ and
		// served at /panel/. A relative base breaks when the URL lacks the
		// trailing slash.
		base: "/panel/",
		plugins: [
			// Must run before react() — wrong order breaks route generation.
			tanstackRouter({ target: "react" }),
			react(),
		],
		resolve: {
			alias: { "@": path.resolve(import.meta.dirname, "./src") },
		},
		server: {
			proxy: {
				"/cgi-bin": camProxy,
				// Event recordings (thumbnails and mp4s) are served from /record/.
				"/record": camProxy,
			},
		},
		build: {
			rolldownOptions: {
				output: {
					// One bundle on purpose: BusyBox httpd sends no Cache-Control or
					// ETag, so every chunk costs a revalidation round trip per load.
					codeSplitting: false,
				},
			},
		},
	};
});
