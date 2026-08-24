# panel — a replacement web UI for yi-hack-Allwinner-v2

A React frontend for the [yi-hack-Allwinner-v2](https://github.com/roleoroleo/yi-hack-Allwinner-v2) camera firmware, maintained as a **frontend-only fork**: everything of ours lives under `panel/` (plus `docs/`), nothing upstream is ever modified, so rebasing onto upstream stays a no-op.

## Stack

React 19 · TypeScript (strict) · Vite 8 · Mantine 9 (AppShell "alt") · TanStack Router (hash history) / Query / Form · zod · axios · hey-api (client generated from `yi-hack-openapi.yaml`) · Phosphor Icons · Biome · Geist Sans/Mono self-hosted via fontsource (the panel must work with no internet access).

## Development

```bash
cd panel
cp .env.example .env.local     # set CAM_HOST (and CAM_USER/CAM_PASS if auth is on)
pnpm install
pnpm dev                       # http://localhost:5173/panel/
```

The dev server proxies `/cgi-bin` and `/record` to `CAM_HOST` and injects basic auth — the camera's BusyBox httpd sends no CORS headers, so the browser cannot call it cross-origin directly. Credentials never enter the bundle.

No camera? Run the mock instead:

```bash
node mock/camera.mjs           # port 8080
# .env.local: CAM_HOST=http://localhost:8080
```

The mock reproduces the firmware's hostile behaviors (failures as HTTP 200, the settings-persistence bug, per-parameter save delays, occasionally malformed status.json), not just its shapes.

## Commands

```bash
pnpm validate      # tsc -b && biome check — run before committing
pnpm generate:sdk  # regenerate src/api from yi-hack-openapi.yaml (wipes the dir)
pnpm build         # production build (single bundle, base /panel/)
pnpm deploy        # build + rsync to root@$CAM_HOST:/tmp/sd/yi-hack/www/panel/
```

`deploy` uses `rsync --delete` on purpose: Vite emits content-hashed filenames and plain `scp` would leave every previous bundle on the SD card forever.

## On the camera

The panel is served by the camera at `http://CAM_IP/panel/`. **The stock UI stays at `/`** — it is the fallback when a deploy goes wrong. Do not delete or overwrite it.

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
