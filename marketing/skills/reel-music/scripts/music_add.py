"""Add a song to the local Reel music library: download (yt-dlp), analyse (BPM, drop), file it by mood.

  python music_add.py <url> --mood hype [--tags "phonk,dark"] [--trending] [--note "..."]
Library folder: $MUSIC_DIR (default ~/Music/reel-music): <slug>.mp3, <slug>.json (analysis), library.json, library.md
Needs: pip install -U yt-dlp numpy ; ffmpeg on PATH.
"""
import argparse, json, os, re, subprocess, sys
from datetime import date
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from music_analyze import analyse

MOODS = {"hype": "🔥 Hype", "uplifting": "✨ Uplifting", "emotional": "💜 Emotional", "dark": "🌑 Tense / Dark", "cool": "😎 Cool / Fun", "phonk": "🏎️ Phonk / Money"}


def lib_dir():
    d = Path(os.environ.get("MUSIC_DIR", Path.home() / "Music" / "reel-music")); d.mkdir(parents=True, exist_ok=True); return d


def load(d):
    f = d / "library.json"
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else []


def save(d, lib):
    (d / "library.json").write_text(json.dumps(lib, indent=1, ensure_ascii=False), encoding="utf-8")
    out = ["# Reel music library", "", "Filed by feeling. ⭐ = trending on Instagram when added. Used = number of Reels that used it.", ""]
    for k, title in MOODS.items():
        rows = [s for s in lib if s["mood"] == k]
        if not rows: continue
        out += [f"## {title}", ""]
        out += [f"- **{s['title']}**{' ⭐' if s.get('trending') else ''} `{s['file']}` {s['bpm']} BPM, drop {s['drop']}s, used {s.get('used', 0)}x - {s.get('tags', '')} {s.get('note', '')}".rstrip() for s in rows]
        out.append("")
    (d / "library.md").write_text("\n".join(out), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url"); ap.add_argument("--mood", required=True, choices=list(MOODS)); ap.add_argument("--tags", default="")
    ap.add_argument("--trending", action="store_true"); ap.add_argument("--note", default="")
    a = ap.parse_args()
    d = lib_dir()
    info = json.loads(subprocess.run([sys.executable, "-m", "yt_dlp", "-J", "--no-playlist", a.url], check=True, capture_output=True, text=True).stdout)
    title = info.get("track") and info.get("artist") and f"{info['track']} - {info['artist']}" or info.get("title", "song")
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:60]
    subprocess.run([sys.executable, "-m", "yt_dlp", "--no-playlist", "-x", "--audio-format", "mp3", "--audio-quality", "0", "-o", str(d / f"{slug}.%(ext)s"), a.url], check=True)
    mp3 = d / f"{slug}.mp3"
    meta = analyse(mp3); (d / f"{slug}.json").write_text(json.dumps(meta, indent=1))
    lib = [s for s in load(d) if s["file"] != mp3.name]
    lib.append({"title": title, "file": mp3.name, "mood": a.mood, "tags": a.tags, "trending": a.trending, "note": a.note, "added": str(date.today()), "used": 0, **meta})
    save(d, lib)
    print(json.dumps({"added": title, "file": str(mp3), **meta}, ensure_ascii=False))


if __name__ == "__main__":
    main()
