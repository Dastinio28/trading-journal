"""Pick a song from the library for a video: by mood (and optional tag words), least used first, trending first on ties.

  python music_pick.py --mood dark [--tags "discipline,loss"] [--use]   -> prints JSON with the mp3 path
--use increments the song's usage counter (call it once the Reel is rendered).
"""
import argparse, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from music_add import lib_dir, load, save


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--mood"); ap.add_argument("--tags", default=""); ap.add_argument("--use", action="store_true")
    a = ap.parse_args(); d = lib_dir(); lib = load(d)
    words = {w.strip().lower() for w in a.tags.split(",") if w.strip()}
    pool = [s for s in lib if not a.mood or s["mood"] == a.mood] or lib
    if not pool: print("library empty: add songs with music_add.py", file=sys.stderr); sys.exit(4)
    pool.sort(key=lambda s: (-len(words & {t.strip().lower() for t in s.get("tags", "").split(",")}), s.get("used", 0), not s.get("trending")))
    s = pool[0]
    if a.use: s["used"] = s.get("used", 0) + 1; save(d, lib)
    print(json.dumps({**s, "path": str(d / s["file"])}, ensure_ascii=False))


if __name__ == "__main__":
    main()
