"""Post a Tradeframe Reel with a licensed track from Instagram's own music library (instagrapi).

Instagram attaches the song itself, so the Reel shows the song name and can ride the audio trend,
and there is no copyright issue (a copyrighted song baked into the MP4 gets muted or blocked).
Runs on the local PC only (the cloud cannot reach Instagram).

  python ig_reel_music.py --session C:/igbot/session.json --reel <mp4> --captions <captions.json> [--trending] [--query "..."] [--preview out.mp4]

--trending picks from Instagram's current trending/top-trends music (music_top_trends / music_trending),
then falls back to the curated phonk queries below.

--preview  builds a local MP4 with the chosen track (no upload) so the result can be checked first.
Exit codes: 0 ok, 2 session expired (rerun ig_login.py), 3 rate limit, 4 no usable track.
Needs: pip install -U instagrapi "moviepy==2.2.1"   (instagrapi >= 3.0, verified against 3.0.21)
"""
import argparse, json, random, sys, tempfile, urllib.request
from pathlib import Path

# Popular dark / phonk / trap tracks used on trading, money and discipline edits.
# Availability depends on the account type (Creator > Business) and the country, so each entry is a search query
# and the script falls back down the list, then to generic queries.
QUERIES = [
    "METAMORPHOSIS INTERWORLD", "Murder In My Mind Kordhell", "Sahara Hensonn", "Close Eyes DVRST", "RAVE Dxrk",
    "Neon Blade MoonDeity", "Psychic Ills phonk", "Shadow Lady phonk", "Override KSLV", "Live Another Day KORDHELL",
    "Scopin Kordhell", "Brazilian Phonk", "Funk Estranho", "Lovely Bastards", "Memory Reboot",
    "Gangsta's Paradise slowed", "After Dark Mr.Kitty", "Sweater Weather slowed", "Another Love slowed", "Snowfall Øneheart",
]
FALLBACK = ["phonk", "slowed reverb", "dark trap", "sigma", "motivation"]


def load_client(session):
    from instagrapi import Client
    from instagrapi.exceptions import LoginRequired
    cl = Client()
    cl.load_settings(session)
    try:
        cl.account_info()
    except LoginRequired:
        print("session expired", file=sys.stderr); sys.exit(2)
    return cl


def used_tracks(posted):
    try:
        return {p.get("track") for p in json.loads(Path(posted).read_text(encoding="utf-8")) if p.get("track")}
    except Exception:
        return set()


def trending_tracks(cl):
    from instagrapi.extractors import extract_track
    found = []
    def walk(x):
        if isinstance(x, dict):
            cand = x.get("track") if isinstance(x.get("track"), dict) else (x if ("audio_cluster_id" in x and "title" in x) else None)
            if cand:
                try:
                    found.append(extract_track(cand))
                except Exception:
                    pass
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)
    for call in (lambda: cl.music_top_trends(page_size=30), lambda: cl.music_trending()):
        try:
            walk(call())
        except Exception:
            continue
        if found:
            break
    return found


def pick_track(cl, query, avoid, seed, trending=False):
    if trending and not query:
        for t in trending_tracks(cl):
            name = f"{t.title} - {t.display_artist}"
            if name not in avoid and getattr(t, "uri", None):
                return t, name, "trending"
    queries = [query] if query else QUERIES[:]
    if not query:
        random.Random(seed).shuffle(queries)
    for q in queries + FALLBACK:
        try:
            tracks = cl.search_music(q)
        except Exception as e:
            if "wait" in str(e).lower() or "429" in str(e):
                print("rate limited", file=sys.stderr); sys.exit(3)
            continue
        for t in tracks[:5]:
            name = f"{t.title} - {t.display_artist}"
            if name not in avoid and getattr(t, "uri", None):
                return t, name, q
    print("no usable track", file=sys.stderr); sys.exit(4)


def preview(video, track, out):
    from moviepy import VideoFileClip, AudioFileClip  # MoviePy 2.x, same as instagrapi
    tmp = Path(tempfile.mkdtemp()) / "track.m4a"
    urllib.request.urlretrieve(track.uri, tmp)
    v, a = VideoFileClip(str(video)), AudioFileClip(str(tmp))
    start = (track.highlight_start_times_in_ms or [0])[0] / 1000
    if start + v.duration > a.duration:
        start = max(0.0, a.duration - v.duration)
    v.with_audio(a.subclipped(start, start + v.duration)).write_videofile(str(out), codec="libx264", audio_codec="aac", fps=v.fps, logger=None)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--session", required=True)
    ap.add_argument("--reel", required=True)
    ap.add_argument("--captions", required=True)
    ap.add_argument("--query")
    ap.add_argument("--trending", action="store_true")
    ap.add_argument("--posted", default="marketing/videos/posted.json")
    ap.add_argument("--preview")
    a = ap.parse_args()
    cl = load_client(a.session)
    track, name, q = pick_track(cl, a.query, used_tracks(a.posted), Path(a.reel).stem, a.trending)
    print(json.dumps({"track": name, "query": q}))
    if a.preview:
        preview(a.reel, track, a.preview); print(json.dumps({"preview": a.preview})); return
    caption = json.loads(Path(a.captions).read_text(encoding="utf-8"))["reelCaption"]
    media = cl.clip_upload_as_reel_with_music(Path(a.reel), caption, track)
    print(json.dumps({"media_url": f"https://www.instagram.com/reel/{media.code}/", "track": name}))


if __name__ == "__main__":
    main()
