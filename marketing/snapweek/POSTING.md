# SnapWeek Reels: posting queue for a local Claude Code session

20 Reels (1080x1920, 60 fps, 36 s, music inside the MP4) live in `marketing/snapweek/videos/` of the `trading-journal` repo
(branch `claude/youthful-fermi-2ogjqi` until it is merged, then `main`). `marketing/snapweek/videos/manifest.json` is the queue,
alternating one "app overview" Reel and one "feature" Reel.

Each folder `<id>/` holds `<id>.mp4`, `cover.jpg`, `caption.txt` (caption + 15 hashtags) and `captions.json` (`{"reelCaption": ...}`).

## Prompt to give the local Claude Code session

```
Pull the trading-journal repo (branch claude/youthful-fermi-2ogjqi, or main once merged).
Read marketing/snapweek/videos/manifest.json. Post the next item not yet listed in marketing/snapweek/videos/posted.json
(skip items with "exists": false) to the SnapWeek Instagram account, one Reel per day, in "order".
Use the tradeframe-instagram skill's publisher with the SnapWeek session file (C:/igbot/session-snapweek.json;
if it does not exist, log in to the SnapWeek account with ig_login.py and save it there, never reuse the Tradeframe session):
  C:\igbot\Scripts\python.exe <skill>\scripts\ig_publish.py --session C:/igbot/session-snapweek.json --what reel
    --reel marketing/snapweek/videos/<video> --thumb marketing/snapweek/videos/<cover> --captions marketing/snapweek/videos/<captions_json>
Optional trending music: marketing/tradeframe-motion/scripts/ig_reel_music.py with the same arguments plus --trending
(preview first with --preview preview.mp4).
Then append {id, posted_at, media_url} to marketing/snapweek/videos/posted.json, commit and push.
Exit code 2 = session expired (re-login), 3 = rate limit (stop for today).
```

Rules: the account must be SnapWeek's, never @tradeframe.trading. One Reel per day. Never post the same id twice.
