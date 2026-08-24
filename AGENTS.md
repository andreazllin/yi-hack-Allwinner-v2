# Purpose of this fork

This is a frontend-only fork: nothing in the firmware itself is changed unless
specified in [FIRMWARE_CHANGES.md](./docs/FIRMWARE_CHANGES.md).

Everything this fork adds lives at paths upstream does not use — `frontend/`,
`src/zz-frontend/`, `src/aa-source-mirrors/`, `src/zz-fork-overrides/`, `docs/`
and `.github/workflows/frontend-*.yml` — so `git rebase upstream/master`
stays a no-op. The one exception is the root `.gitignore`, which gains a few
lines because a root-level path cannot be ignored from anywhere else.

Where an upstream file's behaviour has to change, it is derived at build time
rather than edited in place. See `src/zz-fork-overrides/`, which rewrites the
over-the-air updater to point at this fork.

## Build modules

`scripts/compile.sh` walks `src/*` in glob order and runs
`init.<name>`/`compile.<name>`/`install.<name>` in each directory, so a new
module is picked up with no upstream file touched. Each module's install
rsyncs over the previous one, which makes the ordering prefixes load-bearing:

| Module | Why the name |
|---|---|
| `aa-source-mirrors` | must run **before** the modules whose sources it stages |
| `zz-fork-overrides` | must run **after** `www` to override a file `www` ships |
| `zz-frontend` | must run **after** `www` to win the document root, and relocates the stock UI to `/panel/` |

Renaming any of those three silently breaks it — the build still succeeds and
produces the wrong image.

## Internal coding style

`AGENTS_internal.md` and `docs/internal/` are deliberately untracked, so they
are absent from a fresh clone. `docs/OPENAPI_DEFINITION.md` is the tracked
reference for the camera API and the generated client.
