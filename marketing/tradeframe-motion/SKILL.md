---
name: tradeframe-motion
description: Produces retention-built motion-design Reels (1080x1920, 60 fps, original phonk score baked in) that promote the Tradeframe trading journal (tradeframe.web.app), ALL IN ENGLISH. Each video = rapid kinetic hook (one slam word per beat, light/dark flips, stretch/snap/echo/glitch effects, 3-2-1), logo drop, then one or more app features shown in a 3D camera rig over a faithful Tradeframe UI (Dashboard, New Position, Calendar, AI Analysis, Pre-Trade Checklist, Advanced Statistics, Risk Management, Trade Journal, Import Trades) with kinetic subtitles, hand-drawn callouts, punch-ins and a progress bar, then a CTA. Demo data, music and visuals change per video from a seed; the dark slowed finance phonk (cowbell, saturated 808, cash-register hits) is synthesized in code at the video's BPM so every cut lands on the beat. Use whenever Dastan asks for a Tradeframe motion video, reel, short, TikTok, promo film, feature video, a batch of videos, or to add/modify one. Triggers: motion design Tradeframe, reel Tradeframe, vidéo Tradeframe, vidéos motion, short, TikTok, promo journal de trading, @tradeframe.trading.
---

# tradeframe-motion

Makes Instagram/TikTok Reels for **@tradeframe.trading** in the style Dastan validated on 04/10/2026: something new on (almost) every beat so nobody swipes, and an "aura" from a dark slowed phonk score. English only.

## Quick start

```bash
# all videos listed in videos.json (3 in parallel), then the posting manifest
bash scripts/render-all.sh <outDir> 3
# resumable batch: renders only missing MP4s, commits + pushes every 9 (safe to rerun after a crash)
bash scripts/render-queue.sh <outDir> 3 --push
# re-capture covers (frame where scene 1's 2nd subtitle is fully visible)
node scripts/covers.js <outDir> [id...]
# one video
node scripts/render.js <id> <outDir>          # NODE_PATH must reach playwright
# fast visual check (16 frames, no audio)
node scripts/build.js <outDir> <id> && node scripts/check.js <outDir>/<id>/index.html /tmp/chk 16
```

Output per video in `<outDir>/<id>/`: `<id>.mp4` (the Reel, music inside), `cover.jpg`, `caption.txt` (caption + 15 hashtags), `index.html` (interactive preview with Sound on / scrubber; can be published as an Artifact), `track.mp3`, `timeline.json`. `manifest.json` at the root lists every video in posting order.

Needs: Node ≥ 18, Playwright + Chromium, ffmpeg with libx264/aac. No network needed (fonts Manrope/Roboto Mono/Caveat come from Google Fonts in the preview; Sora is embedded; headless rendering uses `ignoreHTTPSErrors`).

## How a video is built

`videos.json` entry → `scripts/build.js` computes a beat timeline → `engine/page.html` + `engine/engine.js` render it frame by frame (pure function of time `t`) → `scripts/synth.js` writes the score from the same timeline → `scripts/render.js` screenshots 60 fps frames and muxes the MP4.

Structure (in beats, 1 beat = 60/bpm s):
1. **Hook**: one slam card per beat (`hook` array), themes alternate dark/light, then 3-2-1 countdown (`countdown:false` to skip) and an orb that collapses.
2. **Drop**: logo mark springs in with shockwave, particles and a cash-register hit; wordmark + `tagline`; zoom-through the mark.
3. **Scenes** (`scenes` array, keys below): each opens with its own slam card(s) ("01 / 03 · know — WHY?"), then the app window flies in and the scene plays its camera moves, cursor clicks, typing, subtitles and callouts. One-scene videos are stretched ×1.6 (`stretch` to override).
4. **Outro**: the two `outro` lines slam in, the `tradeframe.web.app` pill with shine, "100% free · Runs in your browser", `@tradeframe.trading`.

### Scene library (`engine/scenes.js`)

| key | app page | what it shows |
|---|---|---|
| `add` | New Position | cursor fills asset, LONG, entry/exit/stop; R and P&L auto-computed; emotion; save + toast (+ 00:30 counter slam) |
| `dash` | Dashboard | KPI count-ups, hard cuts to P&L / win rate / equity curve / discipline |
| `cal` | Calendar | month heat-map wave, best day ring, worst day ring, zoom-through |
| `ai` | AI Analysis | insight streaming word by word, win-rate bars with "the leak", rule added in 1 click |
| `ck` | Pre-Trade Checklist | 6 boxes ticked on the beat, discipline score climbs |
| `stats` | Advanced Statistics | KPIs, performance by setup (best row highlighted), P&L by weekday, R distribution |
| `risk` | Risk Management | position-size calculator typed in, exact size, daily loss limit gauge |
| `journal` | Trade Journal | rows stagger in, "Losses" filter, search "FOMO", pattern circled |
| `import` | Import Trades | CSV flies into the drop zone, parsing bar, column mapping, N trades imported |

Each scene defines in relative beats: `cam` (focus selector, scale, rotations, ease; same beat twice = hard cut), `clicks`, `type`, `subs`, `ann` (hand-drawn `arrow`/`circle`), `punch`, `fx` (sound hits), `t` (page animation beats). Text tokens: `{wr} {total} {best} {worst} {n} {month} {rule} {left}`.

### videos.json fields

`id`, `title`, `seed` (drives month, all demo numbers, asset traded, AI insight default, notes), `bpm` (126-142; whole film is timed in beats), `insight` (`count` trades-per-day, `friday`, `revenge`, `stops`), `hook` (`[html, fx, smallLabel, cssClass, beats]`, fx: `stretch|shake|snap|echo|glitch`, `negc` = red), `countdown`, `scenes`, `over` (per-scene `subs`/`ann`/`slam` overrides), `tagline`, `outro` [line1, line2], `music` {`key` semitones, `riff` 0-7, `lead` cowbell|bell|pluck, `drums` half|drift, `dark` 0-1}, `caption`, `hashtags` (15, no #).

Durations: overhead (hook + drop + outro) ≈ 9.5 s, each scene adds ≈ 4-5 s. Target 20-45 s: use 3-6 scenes; `stretch` (1-1.6) slows scenes when a video is short. videos.json holds 120 videos (01-20 = batch 1, 021-120 = batch 2, avg 25 s, 21-35 s).

To add a video: append an entry with a new seed, a new hook, a new riff/key/lead combination (never reuse the same music+seed pair), then `node scripts/render.js <id> <out>` and `node scripts/manifest.js <out>`.

## Style rules (validated by Dastan, keep them)

- English only, Tradeframe brand: bg `#0d0f15`, teal `#5eead4` → violet `#a78bfa` gradient, Sora 800 display, Manrope UI, Roboto Mono data, Caveat for hand callouts only. LONG = sky blue with arrow, no red on non-negative data.
- Retention: a new visual event every ≤ 1-2 beats (hard cut, slam word, subtitle swap, callout, punch-in, light/dark flip); progress bar on top; kinetic subtitles at the top of the app shots.
- Music: dark, aggressive, slowed finance phonk, synthesized (no copyrighted track, Instagram desktop can't add sounds, so music must be inside the MP4). Same BPM as the cut.
- All figures are demo data; never present them as real users' results. No financial advice wording.
- Respect `prefers-reduced-motion` in the preview (engine already turns camera moves into cuts).

## Posting

See `references/posting.md`: how a local Claude Code session posts the queue from `manifest.json` (reuses the `tradeframe-instagram` skill's instagrapi publisher), one Reel per day, in order.
