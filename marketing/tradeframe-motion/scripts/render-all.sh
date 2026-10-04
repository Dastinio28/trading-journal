#!/usr/bin/env bash
# Render every video in videos.json, 3 in parallel, then write the manifest.  bash scripts/render-all.sh [outDir] [parallel]
set -e
HERE="$(cd "$(dirname "$0")/.." && pwd)"; OUT="${1:-$HERE/../videos}"; PAR="${2:-3}"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
node -e "require('$HERE/videos.json').forEach(v=>console.log(v.id))" | xargs -P "$PAR" -I{} node "$HERE/scripts/render.js" {} "$OUT"
node "$HERE/scripts/manifest.js" "$OUT"
