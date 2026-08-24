#!/bin/sh
# Build and deploy the frontend to the camera's SD card.
#
#   CAM_HOST=192.168.10.211 pnpm deploy
#
# Two details that are not optional:
#
# 1. rsync --delete, not scp. Vite emits content-hashed filenames, so plain
#    copying leaves every previous bundle on the SD card forever.
# 2. Pre-gzip. BusyBox httpd does NOT compress on the fly, but it does serve
#    foo.js.gz transparently when a client requests foo.js with
#    Accept-Encoding: gzip. Without this step the camera ships the raw
#    ~1 MB bundle instead of ~300 kB. Upstream's own build does the same
#    (compile.www gzips everything under www/ except cgi-bin/), which is
#    how we know the feature is compiled into their BusyBox.
#
# Note gzip -9 replaces the files, so only .gz remains — there is no
# plaintext fallback. If assets 404 after a deploy, that is the first
# thing to check.
set -eu

: "${CAM_HOST:?set CAM_HOST to the camera address}"
SSH_USER="${CAM_SSH_USER:-root}"
TARGET="/tmp/sd/yi-hack/www/frontend/"

pnpm build

find dist -type f ! -name '*.gz' -exec gzip -9 {} +

rsync -a --delete dist/ "$SSH_USER@$CAM_HOST:$TARGET"

echo "deployed to http://$CAM_HOST/frontend/  (stock UI remains at /)"
