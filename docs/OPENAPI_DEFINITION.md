# The OpenAPI definition: what it is, how it was made, how to maintain it

The camera's HTTP API is described by **`frontend/yi-hack-openapi.yaml`** (OpenAPI 3.0.3 — 27 paths, 27 operations, 22 component schemas). The frontend's TypeScript client in `frontend/src/api/` is generated from it. This document tells the next agent how the definition was produced, which modelling decisions are deliberate, and how to extend or re-verify it when upstream changes.

## 1. What the API actually is

There is no designed API. The camera runs BusyBox `httpd` serving 28 shell CGI scripts (~2300 lines) at `src/www/httpd/cgi-bin/`. **The shell source is the specification.** The project wiki is wrong in several known places; your training data on this niche firmware is probably absent. When the YAML and the shell disagree, the shell wins — fix the YAML.

Four facts break naive clients (they lead `info.description` in the YAML; never "fix" them):

1. **Every failure is HTTP 200.** The scripts exit 0 on every path. A rejected request is a 200 whose body is `{"error":"true"}`. There are no 4xx/5xx from the scripts. The only real non-200 is `401` from BusyBox httpd itself when auth is enabled.
2. **`error` and every yes/no value are strings**, printed with quotes: `"true"`/`"false"`, `"yes"`/`"no"`. Never booleans. The firmware does not recognise `true`/`1`/`on`.
3. **Invalid parameter values succeed silently.** Values are matched with literal string comparisons and no `else`; an out-of-domain value is dropped and the endpoint still reports success. Validate client-side.
4. **GET mutates.** Reboot, delete, PTZ, settings are all GET. Never let a router preload, prefetcher or crawler near this API.

## 2. How it was produced (repeatable method)

Every script follows nearly the same template. Extraction is mechanical once you see the shape:

- `for I in 1 2 ... N` over `QUERY_STRING` → **max parameter count** (parameter N+1 is silently discarded — recorded in each operation description).
- `if [ "$CONF" == "x" ]` → a query parameter named `x`; the nested test on `$VAL` → its enum. **A branch with no `else` = silent drop.**
- `printf "Content-type: ..."` → response media type(s); some scripts emit different types on different paths (modelled as multiple content types under the same `200`).
- The `printf` body block → response schema. `\"%s\"` = JSON string; bare `%s` = raw JSON spliced in (only `local_fw` in fw_upgrade and `result` in proxy).
- `validate.sh` (89 lines) defines shared validators used everywhere. They are character **blocklists**, not whitelists — read it first.
- Count sleeps: `camera_settings.sh` sleeps 0.5 s per loop iteration (~7.5 s for a 15-param save, ~9 s worst case). This drives frontend UX (batched saves, no per-toggle writes).

The process used in 2026-08: parallel extraction agents read every script completely and returned structured contracts traced to `file:line`; the YAML was authored from those under the modelling rules below; then a second, adversarial pass re-read every script trying to refute each YAML claim (12 corrections applied, 19 operations confirmed faithful on first pass). If you extend the spec, keep that bar: **every parameter and enum value must trace to a shell line you read.** Do not fill gaps from the wiki or from memory.

Cross-checks that catch real bugs: grep for who *writes* a config file, not just who reads it (`camera_settings.sh` applies but never persists `camera.conf` — that is why saving is two calls, see §5); compare the three consumers of the same config (web UI, MQTT layer, Home Assistant integration); reproduce shell semantics under `dash` instead of reasoning about them (`cut` returns the whole line when the delimiter is absent; `VAR = "x"` with spaces is a no-op command, rc=127).

## 3. Deliberate modelling decisions — do not "fix" these

- **OpenAPI 3.0.3, not 3.1.** No `info.summary` anywhere (3.1-only; breaks 3.0 validators).
- **`200` is the only success response and covers failures too.** Adding a 400 would be inventing behaviour. `401` (description-only) is on every operation because BusyBox emits it; `basicAuth` is declared as an optional security scheme.
- **`error` is `type: string, enum: ["true","false"]`**; shared **`YesNo`** schema for yes/no fields. Modelling either as boolean breaks every generated client.
- **Multiple content types under one `200`** for `getSnapshot` (`image/jpeg`, the literal non-standard `image/jpeg;base64`, `application/json`), `getLastRecordedVideo` (`video/mp4; charset=utf-8` — the charset param is really emitted), `firmwareUpgrade`. Splitting them into separate paths would misrepresent the API.
- **`wifi` is one POST operation** covering both modes. The firmware serves `action=scan` as GET and `action=save` as POST-with-body; GET+requestBody is undefined in 3.0, so POST was chosen and the description records the scan-is-GET reality.
- **`conf` on get/set_configs is an advisory enum.** The scripts have NO allowlist — the value is interpolated into `etc/<X>.conf` (path traversal and all). The enum lists the six values the firmware/UI actually use.
- **The `*Conf` component schemas (CameraConf, SystemConf, MqttConf, MqttAdvertiseConf, PtzPresetsConf, ProxychainsConf) are intentionally unreferenced.** 3.0 cannot switch a response schema on a query parameter, but the generator still emits their types and the frontend needs them. They are typed from the shipped `.conf` templates under `src/static/static/yi-hack/etc/` (ground truth for key lists). Redocly's 6 `no-unused-components` warnings + 1 `info-license` warning are accepted; **errors must stay at zero.**
- **`get_configs` responses carry a fake trailing `"NULL":"NULL"` key** (avoids a trailing comma in the shell printf). Clients must strip it; the schemas document it.

## 4. Validation and generation

```bash
cd frontend
npx --yes @redocly/cli@latest lint yi-hack-openapi.yaml   # 0 errors, 7 accepted warnings
pnpm generate:sdk                                          # hey-api → src/api (wipes the dir)
pnpm validate                                              # tsc -b && biome check
```

YAML trap: an unquoted scalar containing `: ` (colon-space) breaks parsing with a confusing "mapping values are not allowed" error — quote such descriptions.

### hey-api specifics (pinned `@hey-api/openapi-ts@0.99.0` — pre-1.0, breaking minors; pin exact)

Config: `frontend/openapi-ts.config.ts`. Plugins: `@hey-api/client-axios` (with **`baseUrl: false`** — otherwise `servers[0]` gets baked into the client and breaks same-origin deploys), `@hey-api/typescript`, `@hey-api/sdk`, `@tanstack/react-query`, `zod`.

Generated layout in `frontend/src/api/` (**never hand-edit — `clean: true` wipes it every run**): `types.gen.ts`, `sdk.gen.ts`, `client.gen.ts` (singleton `client`), `zod.gen.ts`, `@tanstack/react-query.gen.ts`, plus the bundled `client/` and `core/` runtime. The barrel `index.ts` re-exports SDK + types only — **import TanStack factories from `@/api/@tanstack/react-query.gen` and zod schemas from `@/api/zod.gen` directly.**

Gotchas verified against 0.99.0:

- **Binary content types are silently dropped** from generated response types when a `200` also has JSON, and the SDK hardcodes `responseType: 'json'`. For snapshot images and video downloads use plain `<img src>`/`<a href>`/raw axios with `responseType: 'blob'`, not the SDK.
- **Mutating GETs get `queryOptions` factories, not mutations** (the plugin keys off the HTTP method). Never hand `setCameraSettingsOptions`, `rebootOptions`, `deleteEventDirOptions`, `ptzMoveOptions`… to `useQuery` — wrap the SDK function in a manual `useMutation({ mutationFn: () => sdkFn({...}) })` in a feature hook.
- TanStack factories call the SDK with `throwOnError: true` internally: `useQuery`'s `data` is the unwrapped body; transport errors land in `error` as `AxiosError`.
- **Logical failures arrive on the success path** (fact 1 above): after any call, check `data.error === "true"`. The response validator is deliberately OFF in the SDK config — the CGI JSON is too loose (unescaped `printf`, fake `NULL` keys) for strict parsing to be safe.
- Empty 200 bodies become `{}` (`data ?? {}` in the axios client).
- Runtime wiring (baseURL `""`, axios interceptors, the 2-request concurrency semaphore) lives in `frontend/src/lib/api-client.ts`, outside the wiped directory.

## 5. Behavioral knowledge the spec encodes (read the descriptions)

- `camera_settings.sh`: max 15 params, ~7.5–9 s per save (0.5 s sleep per loop iteration), **applies but does not persist** — persisting requires a second call, `set_configs.sh?conf=camera` (apply first, then persist). The stock UI omits the persist call, which is why its settings revert.
- `set_configs.sh` reads its JSON body with `read -r`: **single-line JSON only** (`JSON.stringify` is fine, pretty-printed bodies fail).
- `eventsdirdel.sh` has a broken validator (spaced assignment = no-op) and passes `dir` to root `rm -rf` unquoted — validate client-side against the spec's pattern and keep firmware auth enabled.
- `status.json` can emit malformed JSON (unescaped printf of SSID/hostname).
- `preset.sh` word-splits multi-word backend messages across printf format cycles → malformed JSON with `message` holding only the first word.
- Snapshots can reboot the camera under load (upstream README) — the stock UI fetches exactly one frame per page load; do not poll aggressively.

## 5b. Over-the-air updates point at this fork

`fw_upgrade.sh` asks GitHub for the latest release of the repo it was compiled against, compares that tag with `/tmp/sd/yi-hack/version`, and downloads `<model_suffix>_<tag>.tgz`. The payload is the **whole yi-hack tree**, so an update ships the firmware and the frontend together — that is what makes the frontend updatable over the air at all.

Left pointing at upstream this is actively harmful: a camera running `0.3.6_<hash>` sees upstream's `0.3.6`, decides the versions differ, and installs upstream's image — replacing the fork. `system.sh` completes an upgrade with `cp -rf * ..`, an overlay that removes nothing, so the result is a mess rather than a clean revert: upstream's `index.html` takes the document root back and its `js/`, `css/`, `pages/` and `img/` reappear there, while the frontend's `assets/` and the relocated stock UI under `panel/` are left behind as orphans nothing maintains.

`src/zz-fork-overrides/` rewrites the three release URLs at build time, deriving the file from upstream's current source rather than vendoring a copy, so an upstream edit to `fw_upgrade.sh` is inherited instead of silently reverted. The slug comes from `FORK_REPO`, else `GITHUB_REPOSITORY` in CI, else the `origin` remote.

Two things to know before renaming anything:

- **The `zz-` prefix is load-bearing.** `scripts/compile.sh` walks `src/*` in glob order and each module's install rsyncs over the previous one, so a module overriding a file shipped by `src/www` must sort *after* `www`. Rename it to something earlier and the override silently reverts.
- **The build fails loudly** if upstream stops referencing the slug in a recognisable form, if the rewrite count changes, or if the packed image still mentions upstream — rather than shipping an image that updates itself away.

## 6. Maintenance: API drift is the real work

The frontend depends on undocumented shell behaviour that upstream can change without a release note. On every upstream sync, diff the backend before rebasing:

```bash
git diff <old>..upstream/master -- src/www/httpd/cgi-bin/
```

| Change in cgi-bin | What to do |
|---|---|
| New/renamed `if [ "$CONF" == "x" ]` | Add/rename the query parameter in the YAML, regenerate |
| Changed value comparison | Update the enum |
| Changed `for I in 1 2 ... N` | Update the param-cap note (and any client-side guard) |
| Changed `sleep` | Update the duration notes (frontend save UX depends on them) |
| New `printf` lines in a response | Extend the response schema |
| `camera_settings.sh` gains a `camera.conf` write | Upstream fixed the persistence bug — keep the two-call save anyway (harmless on fixed firmware, essential on older) |

The firmware **flashed on the camera** is what the frontend talks to, not the source in the checkout — expect version skew in both directions and feature-detect (`status.json.ptz`, `HOMEVER`) rather than version-check.

Not covered by this spec (not CGI): the ONVIF service (`/onvif` is exempted from HTTP auth), RTSP streams, go2rtc (only RTSP listens as configured — no browser-playable stream exists in this firmware), and the MQTT topic tree (would suit AsyncAPI if ever documented).

## 7. Honesty about state

Everything here is **verified by reading** (two independent passes over every script) — **nothing has been tested against real hardware**. When you report progress, keep distinguishing *verified by execution* / *verified by reading* / *inferred*. First contact with a real camera will surface surprises; expect them in `status.json` parsing and snapshot timing.
