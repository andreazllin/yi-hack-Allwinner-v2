# Migrating from upstream yi-hack to this fork

This fork ships the same firmware as [roleoroleo/yi-hack-Allwinner-v2](https://github.com/roleoroleo/yi-hack-Allwinner-v2) with a replacement web UI baked in. Migrating means flashing one image; there is no separate "install the frontend" step.

**The camera's own updater cannot do this for you.** Upstream's `fw_upgrade.sh` asks GitHub for the latest release of *upstream*, so a camera running upstream firmware will only ever be offered upstream releases. Both paths below work around that — the first by handing the updater a local file, the second by reinstalling from the SD card.

---

## What changes

| | Upstream | This fork |
|---|---|---|
| Web UI at `/` | stock jQuery UI | the React frontend |
| Stock jQuery UI | `/` | `/panel/` |
| Version string | `0.3.6` | `0.3.6_<short hash>` |
| Updates come from | `roleoroleo/…` | this fork |
| Camera behaviour | — | unchanged |

Nothing in the firmware itself is modified. The camera records, streams, detects motion and speaks exactly as before; only the web surface and the update source differ.

---

## Before you start

1. **Know your model suffix.** It is the `Model` row on the stock status page, or `cat /tmp/sd/yi-hack/model_suffix` over SSH. Examples: `h51ga`, `y21ga`, `r30gb`. Every release asset is named `<model_suffix>_<version>.tgz` and **the wrong model will not boot**.
2. **Back up.** The hack procedure makes one for you, but see upstream's [backup guide](https://github.com/roleoroleo/yi-hack-Allwinner-v2/wiki/Dump-your-backup-firmware-(SD-card)) if you want your own.
3. **Note your settings.** Path A preserves them; Path B does not.
4. **Use a cable if you can.** Both paths reboot the camera, and a flash interrupted over flaky WiFi is how cameras get bricked.

---

## Export your configuration first

Worth doing on both paths — mandatory on Path B, which wipes the card.

On the stock UI: **Maintenance → Save** ("Click to save config"). The browser
downloads `config.tar.bz2`. It contains every `*.conf` from `yi-hack/etc` plus
`hostname` — your services, ports, credentials, MQTT settings, camera settings
and WiFi details.

To restore it afterwards: **Maintenance → Load**, pick the file, and reboot the
camera when it reports success. The new frontend has the same pair on its own
Maintenance page, so you can restore from either UI.

The archive is plain firmware configuration and this fork does not change the
format, so a backup taken from upstream restores onto this fork unchanged.

Three things about the restore that are easy to trip over, all enforced by the
firmware rather than by us:

- **`load.sh` silently drops any upload over 10000 bytes.** No message, no
  error — the request just ends. Config archives are normally a couple of KB,
  but a long crontab can push one over. The frontend blocks oversized files
  before sending rather than letting them vanish; the stock UI does not.
- **The archive must contain both `system.conf` and `camera.conf`**, or the
  restore answers `Upload failed` and changes nothing. A backup made by
  **Save** always does.
- **A reboot is required.** The restore writes the files and re-applies the
  live camera settings, but everything else takes effect on restart.

---

## Path A — in-place upgrade (keeps your configuration)

`fw_upgrade.sh` checks for a file named exactly `<model_suffix>_x.x.x.tgz` in the SD card root *before* it contacts GitHub. If it finds one, it installs that instead. Upstream's updater will therefore install this fork's image without knowing anything about this repo.

1. Download the asset for your model from this fork's [Releases](https://github.com/andreazllin/yi-hack-Allwinner-v2/releases) — e.g. `h51ga_0.3.6_4e26d31.tgz`.
2. **Rename it** to `<model_suffix>_x.x.x.tgz` — e.g. `h51ga_x.x.x.tgz`. The `x.x.x` is literal; it is the marker the script looks for.
3. Copy it to the **root of the camera's SD card** (over FTP/SSH to `/tmp/sd/`, or by taking the card out).
4. Open the stock UI → **Maintenance**. It should report a local firmware file is available.
5. Start the upgrade. The camera backs up its configuration, unpacks the image and reboots.
6. Wait for it to come back — a minute or two — then open `http://<camera-ip>/`.

Path A restores your configuration by itself, so the export above is a safety
net rather than a step — but it costs one click and it is the only way back if
the upgrade goes wrong.

**What is preserved:** everything in `yi-hack/etc/` — your `system.conf`, `camera.conf`, MQTT settings, WiFi credentials, passwords. The script copies that directory out before unpacking and copies it back in afterwards. Any `*.tar.gz` inside `etc/` is dropped.

**Preconditions the script enforces:** an SD card must be mounted, and it needs roughly 100 MB free. Otherwise it answers `No SD detected.` or `No space left on SD.` and does nothing.

---

## Path B — clean install (loses your configuration)

Use this if the camera is unreachable, the SD card is suspect, or you want a known-good starting point.

1. Format an SD card as FAT32 — ideally using the camera's own format function.
2. Download the asset for your model and extract it to the **root** of the card. You should see:
   ```
   |-- Factory/
   |-- yi-hack/
   |-- lower_half_init.sh
   ```
3. Optionally set WiFi credentials up front: rename `Factory/configure_wifi.cfg.ori` to `Factory/configure_wifi.cfg` and edit it.
4. Insert the card and power the camera on. Give it a minute.
5. Open `http://<camera-ip>/`.
6. Restore your settings: **Maintenance → Load**, pick the `config.tar.bz2` you
   exported, then reboot.

The camera needs to keep this card — the hack lives on it.

---

## After migrating

- **`/` is the new frontend. `/panel/` is the stock UI**, unchanged and still fully functional; it stays as the fallback if the frontend ever misbehaves. Update any bookmarks.
- **Updates are now self-serving.** The updater points at this fork, so Maintenance → upgrade will offer this fork's releases from here on. Nothing more to configure.
- **Releases are cut on every push**, so the camera will frequently report a newer version available. There is no obligation to take each one.
- **Authentication is unchanged.** If you had HTTP auth enabled, it still covers `/` and therefore the frontend, because the rule in `httpd.conf` applies to the whole document root.

---

## Rolling back to upstream

The same local-file trick works in reverse, because it never consults GitHub:

1. Download the matching release from [upstream](https://github.com/roleoroleo/yi-hack-Allwinner-v2/releases).
2. Rename it to `<model_suffix>_x.x.x.tgz` and copy it to the SD card root.
3. Maintenance → upgrade.

Or do a clean install (Path B) with upstream's archive. Either way the camera goes back to checking upstream for updates, since the updater is part of the image you just installed.

---

## Things that will bite you

**`pnpm deploy` is not a migration path.** It copies the frontend onto a running camera for development. On a camera still running *upstream* firmware it would overwrite the stock UI's `index.html` at the root while `/panel/` does not yet exist — leaving the stock UI without an entry point. Migrate by flashing an image; use `deploy` only for iterating against a camera already running this fork.

**The version comparison is string equality, not ordering.** The camera reports an update whenever its version differs from the latest release, in either direction. It cannot tell "older" from "newer".

**A stale page after upgrading.** BusyBox sends no cache headers, so a browser may hold on to the previous UI. A hard reload fixes it.

**Model suffix must match exactly.** There is no guard against flashing `y21ga` onto an `h51ga`.

---

## State of this guide

Written from the firmware source — `fw_upgrade.sh` for the upgrade paths and preconditions, `save.sh` and `load.sh` for the configuration export and restore, `system.sh` for how an upgrade completes on reboot, and upstream's README for the clean install. The release archive layout was checked against a real published asset.

**None of it has been exercised on a camera.** The steps follow upstream's own documented procedures, and the local-file path is a feature of upstream's updater rather than anything this fork adds, but treat the first migration as the test. Keep a backup, and keep `/panel/` in mind as the fallback.
