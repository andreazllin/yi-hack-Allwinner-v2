#!/usr/bin/env node
// node:http adapter for the mock camera. All the emulated behavior lives in
// mock/camera-core.mjs; this file only moves bytes.
//
// Run:   node mock/camera.mjs [port]     (default port 8080, Node >= 20)
// Point the frontend dev proxy at it with, in frontend/.env.local:
//   CAM_HOST=http://localhost:8080

import http from "node:http";
import { describeRequest, handle } from "./camera-core.mjs";

const PORT = Number(process.argv[2]) || 8080;

const readBody = (req) =>
	new Promise((resolve) => {
		const chunks = [];
		req.on("data", (c) => chunks.push(c));
		req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
	});

const server = http.createServer(async (req, res) => {
	const body = req.method === "GET" ? "" : await readBody(req);
	const response = await handle({ url: req.url, method: req.method, body });
	console.log(describeRequest(req.method, req.url, response));

	// "Rebooting": the real camera stops answering at the TCP level, and the
	// difference between a dropped socket and an HTTP error is exactly what
	// the frontend's reboot handling has to cope with.
	if (response.networkError) {
		res.socket?.destroy();
		return;
	}
	res.writeHead(response.status, response.headers);
	res.end(response.body);
});

server.listen(PORT, () => {
	console.log(`mock yi-hack camera listening on http://localhost:${PORT}`);
	console.log(
		`frontend dev proxy: set CAM_HOST=http://localhost:${PORT} in frontend/.env.local`,
	);
});
