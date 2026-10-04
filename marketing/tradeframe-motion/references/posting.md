# Posting the Reels from a local Claude Code session

The batch lives in `marketing/videos/` of the `trading-journal` repo (branch `claude/youthful-fermi-2ogjqi`). `manifest.json` is the queue: `order`, `id`, `video` (MP4 path), `cover`, `caption` (caption + hashtags, ready to paste), `captions_json` (the file ig_publish.py reads), `features`.

## Prompt to give the local session

```
Pull the trading-journal repo (branch claude/youthful-fermi-2ogjqi). Read marketing/videos/manifest.json.
Post the next unposted Reel to @tradeframe.trading (order ascending), using the tradeframe-instagram skill's
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
