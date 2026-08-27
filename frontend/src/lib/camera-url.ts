// The camera's own URLs are absolute ("/cgi-bin/...", "/record/..."), because
// the firmware serves the frontend from the document root. The GitHub Pages
// demo is served from /<repo>/ instead, with the mock in a Service Worker
// registered there.
//
// A worker sees every fetch a page it controls makes, wherever it points, but
// it only takes over NAVIGATIONS inside its own scope. The config backup is a
// navigation — an <a href download>, not a fetch — so at /cgi-bin/save.sh it
// would escape the mock and 404 against github.io. Keeping every camera URL
// under the app's base keeps all of them in scope, and makes the demo's
// network traffic legible as belonging to the demo.
//
// In the firmware build BASE_URL is "/" and the prefix is empty, which leaves
// these URLs byte-identical to before.
const PREFIX = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Prefixes an absolute camera path (leading slash included). */
export const cameraPath = (path: string): string => `${PREFIX}${path}`;

/**
 * Base URL for the generated client. hey-api concatenates it with the path
 * (`baseUrl + "/cgi-bin/..."`), so it must not end in a slash.
 */
export const CAMERA_BASE_URL = PREFIX;
