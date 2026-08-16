#!/usr/bin/env bash
# clean.sh — one-command sweep of scratch build artifacts.
#
# Removes the preview scratch tree, build/verification logs, and preview logs
# left behind by .freebuff/run-build.js, .freebuff/start-preview.js, and
# manual typecheck/verify runs, so cleanup is one command instead of a manual
# sweep. Files only — running servers are left alone (with a heads-up below).
#
# Usage: npm run clean                (or: bash scripts/clean.sh)
#        npm run clean -- --dry-run   (list what would be removed, delete nothing)

set -u

DRY_RUN=0
case "${1:-}" in
  --dry-run|-n) DRY_RUN=1 ;;
  "") ;;
  *) echo "Unknown argument: $1 (supported: --dry-run)" >&2; exit 2 ;;
esac

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Scratch tree used by the detached build/preview tooling.
SCRATCH=/tmp/oan-fresh

# Build/verification logs written by the tooling and manual runs.
BUILD_LOGS=(
  /tmp/build-final.log
  /tmp/tsc.log
  /tmp/tsc2.log
  /tmp/tsc-obs.log
  /tmp/verify-report.log
  /tmp/oan-commit-msg.txt
)

# Preview logs (already gitignored via .freebuff/logs/). The glob loop keeps
# this bash-3.2-safe (no nullglob/array under `set -u`) and reports 0 when
# empty. Sweeps the new .freebuff/logs/ dir plus any legacy logs left at the
# old root.
# Count first, then list/delete — two glob passes keep this bash-3.2-safe
# (${#arr[@]} on an empty array is "unbound variable" under `set -u` on 3.2).
preview_count=0
for f in "$ROOT"/.freebuff/logs/preview-*.log "$ROOT"/.freebuff/preview-*.log; do
  if [ -e "$f" ]; then
    preview_count=$((preview_count + 1))
  fi
done

if [ "$DRY_RUN" -eq 1 ]; then
  echo "Dry run — nothing will be deleted:"
else
  echo "Cleaning OpenAnimalNet build artifacts…"
fi

# Scratch tree.
if [ -e "$SCRATCH" ]; then
  echo "  scratch tree:  $SCRATCH"
  [ "$DRY_RUN" -eq 1 ] || rm -rf "$SCRATCH"
else
  echo "  scratch tree:  (none)"
fi

# Build logs.
echo "  build logs:"
build_found=0
for f in "${BUILD_LOGS[@]}"; do
  if [ -e "$f" ]; then
    build_found=1
    echo "    $f"
    [ "$DRY_RUN" -eq 1 ] || rm -f "$f"
  fi
done
[ "$build_found" -eq 1 ] || echo "    (none)"

# Preview logs.
echo "  preview logs:  $preview_count file(s)"
for f in "$ROOT"/.freebuff/logs/preview-*.log "$ROOT"/.freebuff/preview-*.log; do
  if [ -e "$f" ]; then
    echo "    $f"
    [ "$DRY_RUN" -eq 1 ] || rm -f "$f"
  fi
done

# Heads-up if a preview server is still running against the removed tree
# (informational only — dry runs skip it since nothing is being removed).
if [ "$DRY_RUN" -eq 0 ] && command -v lsof >/dev/null 2>&1 \
  && lsof -nP -iTCP:3100 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Note: something is still listening on port 3100 — stop the preview server"
  echo "      (kill the 'next start' process) if you want a fully clean slate."
fi

echo "Done."
