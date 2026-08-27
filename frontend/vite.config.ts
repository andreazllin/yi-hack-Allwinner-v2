import { readFileSync } from "node:fs";
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

	// `pnpm build:demo` (mode "demo") builds the GitHub Pages demo: no camera,
	// the mock from mock/camera-core.mjs running in a Service Worker.
	const isDemo = env.VITE_DEMO === "1";

	const camProxy: ProxyOptions = {
		target,
		changeOrigin: true,
		// Basic auth is injected by the proxy; credentials never enter the bundle.
		...(env.CAM_USER ? { auth: `${env.CAM_USER}:${env.CAM_PASS ?? ""}` } : {}),
	};

	return {
		// The frontend is the camera's default UI, served from the document root.
		// Kept absolute rather than relative so an asset URL never depends on the
		// depth of the page that requested it.
		base: "/",
		plugins: [
			// Must run before react() — wrong order breaks route generation.
			tanstackRouter({ target: "react" }),
			react(),
			// msw's worker script is vendored (mock/mockServiceWorker.js, written
			// by `msw init`) and has to be served from the app's base, next to
			// index.html. It is emitted here rather than kept in public/ because
			// public/ is copied into every build, and a mock service worker must
			// never reach the camera's SD card.
			isDemo && {
				name: "yi-hack-emit-mock-worker",
				apply: "build" as const,
				generateBundle() {
					this.emitFile({
						type: "asset" as const,
						fileName: "mockServiceWorker.js",
						source: readFileSync(
							path.resolve(import.meta.dirname, "mock/mockServiceWorker.js"),
							"utf8",
						),
					});
				},
			},
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
					// BusyBox httpd sends no Cache-Control or ETag, so every chunk
					// costs a revalidation round trip per load — the eager app stays
					// one bundle. Splitting is on only because the app has exactly
					// one dynamic import (zxcvbn, in password-strength-meter.tsx),
					// and that round trip is paid on the visit that sets a password
					// rather than on all of them.
					codeSplitting: true,
				},
			},
		},
	};
});
