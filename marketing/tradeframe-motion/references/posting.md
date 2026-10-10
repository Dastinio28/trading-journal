# Posting the Reels from a local Claude Code session

The batch lives in `marketing/videos/` of the `trading-journal` repo (branch `main`). `manifest.json` is the queue: `order`, `id`, `video` (MP4 path), `cover`, `caption` (caption + hashtags, ready to paste), `captions_json` (the file ig_publish.py reads), `features`.

## Prompt to give the local session

```
Pull the trading-journal repo (branch main). Read marketing/videos/manifest.json.
Post the next unposted Reel (skip items with "exists": false) to @tradeframe.trading (order ascending), using the tradeframe-instagram skill's
publisher: C:\igbot\Scripts\python.exe <skill>\scripts\ig_publish.py --session C:/igbot/session.json
--what reel --reel <video> --thumb <cover> --captions <captions_json>  (each video folder has a captions.json {"reelCaption": ...}).
Then append {id, posted_at, media_url} to marketing/videos/posted.json so it is never posted twice.
One Reel per day. If ig_publish exits 2 (session expired) tell me to rerun ig_login.py; exit 3 = rate limit, stop.
```

## Rules

- One Reel per day, in manifest order; never post the same `id` twice (check `posted.json`).
- Account must be @tradeframe.trading.
- Fallback if the API path fails: upload the MP4 manually from Instagram on desktop (music is already in the file) and paste `caption.txt`.
- Cross-post the same MP4 to TikTok / YouTube Shorts the same day (caption shortened for X).

## Trending music (optional, instagrapi)

`scripts/ig_reel_music.py` posts the Reel with a track from Instagram's own music library (trending first with `--trending`,
then curated phonk queries). Instagram replaces the MP4's audio with the song and shows the song name on the Reel.
Unofficial API (same instagrapi session as ig_publish.py): keep 1 Reel/day. Popular songs need a Creator account.

```
C:\igbot\Scripts\pip install -U instagrapi "moviepy==2.2.1"
# 1) check first, nothing is posted: builds preview.mp4 with the chosen song
C:\igbot\Scripts\python.exe <skill>\scripts\ig_reel_music.py --session C:/igbot/session.json --reel <video> --captions <captions_json> --trending --preview preview.mp4
# 2) post
C:\igbot\Scripts\python.exe <skill>\scripts\ig_reel_music.py --session C:/igbot/session.json --reel <video> --captions <captions_json> --trending
```
Log the printed `track` in posted.json (the script never reuses a logged track). Exit 4 = no usable track: fall back to ig_publish.py.
