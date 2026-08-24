#!/bin/sh
# Rebase the frontend branch onto upstream, refusing to proceed silently if the
# CGI backend changed.
#
#   sh frontend/scripts/sync-upstream.sh
#
# Rebasing is the easy part. The hard part is that this frontend depends on
# undocumented shell behaviour that upstream can change without a release
# note: a one-line edit to a CGI script can silently break the frontend, and
# there is no contract to catch it. So the CGI diff is not housekeeping, it
# is the actual work — this script makes it impossible to skip.
#
# What to look for in the diff (see docs/OPENAPI_DEFINITION.md §6):
#   new/renamed `if [ "$CONF" == "x" ]`  -> a query parameter changed
#   a changed value comparison           -> an enum shifted
#   a changed `for I in 1 2 ... N`        -> the parameter cap moved
#   a changed `sleep`                    -> save-duration estimates are wrong
#   new `printf` lines                   -> new response fields
#   camera_settings.sh writing camera.conf -> upstream fixed the A1 bug
#     (keep the frontend's two-call save anyway: harmless against fixed
#      firmware, essential against the older firmware users still run)
set -eu

CGI_PATH="src/www/httpd/cgi-bin"
BASE_TAG="frontend-base"

cd "$(git rev-parse --show-toplevel)"

git fetch upstream

if git rev-parse -q --verify "refs/tags/$BASE_TAG" >/dev/null; then
    OLD=$(git rev-parse "$BASE_TAG")
else
    echo "No $BASE_TAG tag yet. Create it once with:"
    echo "    git tag $BASE_TAG upstream/master"
    echo "It records which upstream commit you were sitting on; after a rebase"
    echo "git itself no longer knows."
    exit 1
fi

echo "== upstream changes since $BASE_TAG =="
git diff --stat "$OLD..upstream/master" || true

echo
echo "== backend diff ($CGI_PATH) =="
if git diff --quiet "$OLD..upstream/master" -- "$CGI_PATH"; then
    echo "none - the API the frontend talks to is unchanged."
else
    git diff "$OLD..upstream/master" -- "$CGI_PATH"
    echo
    echo "REFUSING TO REBASE: the CGI backend changed."
    echo "Review the diff above against frontend/yi-hack-openapi.yaml, update the"
    echo "spec and run 'pnpm generate:sdk', then re-run this script."
    echo "Override deliberately with: SKIP_CGI_CHECK=1 sh frontend/scripts/sync-upstream.sh"
    [ "${SKIP_CGI_CHECK:-0}" = "1" ] || exit 2
    echo "SKIP_CGI_CHECK=1 set - continuing anyway."
fi

echo
echo "== rebasing onto upstream/master =="
git rebase upstream/master
git tag -f "$BASE_TAG" upstream/master

echo
echo "Done. Remember the firmware flashed on the camera is what the frontend"
echo "talks to, not the source in this checkout - expect version skew and"
echo "feature-detect rather than version-check."
