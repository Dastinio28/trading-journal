#!/usr/bin/env bash
# Resumable batch render: renders every videos.json entry whose MP4 is missing (PAR in parallel),
# and with --push commits + pushes the finished videos every BATCH renders.
# bash scripts/render-queue.sh [outDir] [parallel] [--push]
HERE="$(cd "$(dirname "$0")/.." && pwd)"; OUT="${1:-$HERE/../videos}"; PAR="${2:-3}"; PUSH="$3"; BATCH=9
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
[ -f "$OUT/render.log" ] && mv "$OUT/render.log" "$OUT/render.prev.log"  # fresh log so watchers do not see an old QUEUE_DONE
REPO="$(git -C "$HERE" rev-parse --show-toplevel)"; BR="$(git -C "$REPO" branch --show-current)"
commit() {
  node "$HERE/scripts/manifest.js" "$OUT" >/dev/null
  [ "$PUSH" = "--push" ] || return 0
  git -C "$REPO" add -A "$OUT" "$HERE/videos.json" && git -C "$REPO" commit -qm "Tradeframe Reels: $1" || return 0
  for i in 1 2 3 4 5; do git -C "$REPO" push -q -u origin "$BR" && return 0; sleep $((2**i)); done
}
while :; do
  TODO=$(node -e "const fs=require('fs');require('$HERE/videos.json').filter(v=>!fs.existsSync('$OUT/'+v.id+'/'+v.id+'.mp4')).slice(0,$BATCH).forEach(v=>console.log(v.id))")
  [ -z "$TODO" ] && break
  echo "$TODO" | xargs -P "$PAR" -I{} sh -c "node '$HERE/scripts/render.js' {} '$OUT' >> '$OUT/render.log' 2>&1 || echo 'FAIL {}' >> '$OUT/render.log'"
  # stop if a whole batch failed (avoid infinite loop)
  LEFT=$(echo "$TODO" | while read id; do [ -f "$OUT/$id/$id.mp4" ] || echo "$id"; done | wc -l)
  commit "$(echo "$TODO" | head -1) .. $(echo "$TODO" | tail -1)"
  [ "$LEFT" -eq "$(echo "$TODO" | wc -l)" ] && { echo "batch failed entirely" >> "$OUT/render.log"; exit 1; }
done
commit "queue complete"; echo QUEUE_DONE >> "$OUT/render.log"
