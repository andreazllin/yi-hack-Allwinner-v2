# frontend — a replacement web UI for yi-hack-Allwinner-v2

A React frontend for the [yi-hack-Allwinner-v2](https://github.com/roleoroleo/yi-hack-Allwinner-v2) camera firmware, maintained as a **frontend-only fork**: everything of ours lives under `frontend/` (plus `docs/`), nothing upstream is ever modified, so rebasing onto upstream stays a no-op.

## Stack

React 19 · TypeScript (strict) · Vite 8 · Mantine 9 (AppShell "alt") · TanStack Router (hash history) / Query / Form · zod · axios · hey-api (client generated from `yi-hack-openapi.yaml`) · Phosphor Icons · Biome · Geist Sans/Mono self-hosted via fontsource (the frontend must work with no internet access).

## Development

```bash
cd frontend
cp .env.example .env.local     # set CAM_HOST (and CAM_USER/CAM_PASS if auth is on)
pnpm install
pnpm dev                       # http://localhost:5173/
```

The dev server proxies `/cgi-bin` and `/record` to `CAM_HOST` and injects basic auth — the camera's BusyBox httpd sends no CORS headers, so the browser cannot call it cross-origin directly. Credentials never enter the bundle.

No camera? Run the mock instead:

```bash
node mock/camera.mjs           # port 8080
# .env.local: CAM_HOST=http://localhost:8080
```

The mock reproduces the firmware's hostile behaviors (failures as HTTP 200, the settings-persistence bug, per-parameter save delays, occasionally malformed status.json), not just its shapes.

The emulation itself lives in `mock/camera-core.mjs` and knows nothing about transports. `mock/camera.mjs` wraps it in a `node:http` server for the command above; `src/lib/mock/start.ts` wraps the same file in a Service Worker for the demo build below. Behavior only ever changes in one place.

## Commands

```bash
pnpm validate      # tsc -b && biome check — run before committing
pnpm generate:sdk  # regenerate src/api from yi-hack-openapi.yaml (wipes the dir)
pnpm build         # production build (one bundle + the lazy zxcvbn chunk, served from /)
pnpm build:demo    # mocked build for GitHub Pages (see below)
pnpm deploy        # build + rsync to root@$CAM_HOST:/tmp/sd/yi-hack/www/
```

`deploy` uses `rsync --delete` on purpose: Vite emits content-hashed filenames and plain `scp` would leave every previous bundle on the SD card forever.

## On the camera

The frontend is the camera's default UI, served at `http://CAM_IP/`. **The stock UI moves to `/panel/`** and remains the fallback when a deploy goes wrong — do not delete it.

Because the frontend shares the document root with the firmware's own `www` tree (`cgi-bin`, `pages`, `js`, `css`, `img`, `panel`), `pnpm deploy` scopes its `--delete` to `assets/`. A `--delete` against the root would erase the CGI scripts the camera is driven by.

## The mocked demo

`.github/workflows/frontend-pages.yml` publishes the UI to GitHub Pages on every push to `master`, with no camera behind it: `pnpm build:demo` sets `VITE_DEMO=1`, and the app then starts the mock in a Service Worker before the first query fires. State is per-tab and resets on reload.

A Service Worker rather than a mocked HTTP client because four surfaces reach the camera without going through the generated SDK — the snapshot and PTZ previews, event thumbnails and recordings, and the config backup download. Only network-level interception covers those.

To check it locally, exactly as Pages serves it:

```bash
pnpm build:demo --base=/yi-hack-Allwinner-v2/
pnpm exec vite preview --base=/yi-hack-Allwinner-v2/
```

Two things this costs, and one setting it needs:

- Every camera URL is prefixed with Vite's `BASE_URL` (`src/lib/camera-url.ts`), because the demo is served from a subpath. In the firmware build that prefix is empty.
- `msw` is a devDependency and the mock is behind a build-time flag, so neither reaches the firmware bundle. `frontend-release.yml` fails the release if either ever does.
- Pages has to be enabled once by hand: **Settings → Pages → Source: GitHub Actions**. The workflow cannot set that for itself.

The mock's MP4 is a valid-box stub, not a playable video, so the recording and time-lapse players show a failed video element — the same as against the node mock. "Reboot" produces ten seconds of dropped requests, and the backup download yields a stub archive.

## Where the knowledge lives

| File | What |
|---|---|
| `yi-hack-openapi.yaml` | The API, reverse-engineered from the CGI shell source (the wiki is wrong in places) |
| `../docs/OPENAPI_DEFINITION.md` | How the spec was made, deliberate modelling decisions, hey-api gotchas, drift maintenance |
| `../docs/notes/stock-ui-audit.md` | Every stock page's controls, config keys, and save flows — the functional reference |
| `../docs/HANDOFF.md` | The original reverse-engineering briefing |
| `../AGENTS.md` → `../AGENTS_internal.md` | Coding conventions |

Four facts about the API that break naive code: every failure is HTTP 200 (check the body for `"error":"true"`); yes/no and error values are strings, never booleans; invalid values succeed silently; **GET mutates** (reboot, delete, PTZ, settings) — never prefetch.

## Security note

The firmware's HTTP authentication is **off by default**, and `eventsdirdel.sh` passes its parameter to a root `rm -rf` with broken validation. Enable authentication in the camera's configuration and keep the camera off untrusted networks. Nothing here has been tested against real hardware yet — treat every behavior as verified-by-reading until first contact.
