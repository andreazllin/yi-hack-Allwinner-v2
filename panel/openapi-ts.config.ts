import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
	input: "./yi-hack-openapi.yaml",
	output: {
		// clean defaults to true: this directory is wiped on every run.
		// Never hand-edit src/api — runtime wiring lives in src/lib/api-client.ts.
		// No postProcess: biome.json deliberately ignores src/api, so a
		// biome:format step here would fail with "no files processed".
		path: "./src/api",
	},
	plugins: [
		// baseUrl: false — the YAML declares servers: [{url: "/"}]; baking that
		// into the client would break same-origin deploys behind the camera's
		// httpd. Relative URLs resolve against the page origin instead.
		{ name: "@hey-api/client-axios", baseUrl: false },
		"@hey-api/typescript",
		// No response validator: the CGI scripts emit loose hand-rolled JSON
		// (unescaped printf, fake "NULL" keys) — a ZodError would reject the
		// promise even in no-throw call style. zod.gen.ts is still emitted for
		// opt-in parsing at the boundary.
		"@hey-api/sdk",
		{ name: "@tanstack/react-query" },
		"zod",
	],
});
