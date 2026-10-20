---
name: reel-music
description: Local music library for Reels, the workflow shown by @aidendjohnston (day 80 of posting every day). Paste a YouTube/SoundCloud link, the song is downloaded with yt-dlp, analysed (BPM, beat, drop), filed by feeling (Hype, Uplifting, Emotional, Tense/Dark, Cool/Fun, Phonk/Money) in library.md, then suggested by video topic and mixed into the video on the beat. Works with tradeframe-motion (SONG=... locks the film's tempo to the song and lands the song's drop on the logo drop). Use when Dastan pastes a music link, asks to add a song to the library, to put a real or popular song on a Reel, to choose music for a video, or mentions yt-dlp, trending audio, music library. Triggers: musique, son tendance, ajoute ce son, vraie musique, musique populaire, bibliothèque musicale, yt-dlp, music library.
---

# reel-music

Recreates the "Number 4, music" step from @aidendjohnston's Claude Code video pipeline:
"I paste a link, it downloads with yt-dlp, files the song by feeling and vibe, and is able to suggest music based on the video topic.
Half of my music library is trending music, the other half is random (Plants vs Zombies, anime soundtracks)."
(His other steps: cut silences and retakes, 2-3-word subtitles, B-roll. Tradeframe videos already have kinetic 2-4-word captions.)

Runs on Dastan's PC (the cloud session cannot reach YouTube or Instagram).

## Setup (once)

```
pip install -U yt-dlp numpy          # ffmpeg must be on PATH
set MUSIC_DIR=C:\igbot\music         # optional, default: %USERPROFILE%\Music\reel-music
```

## 1. Add a song (paste a link)

```
python scripts/music_add.py "<youtube or soundcloud url>" --mood phonk --tags "money,dark,night" [--trending]
```
- Downloads the audio as mp3 into MUSIC_DIR, analyses BPM / beat / drop (`music_analyze.py`), writes `<slug>.json`.
- Files it in `library.md` (human readable, by feeling) and `library.json` (machine readable). `--trending` marks it ⭐.
- Moods: `hype`, `uplifting`, `emotional`, `dark`, `cool`, `phonk`. Aim for half trending, half evergreen/random.

## 2. Pick a song for a video

```
python scripts/music_pick.py --mood dark --tags "discipline,loss"
```
Returns the best match (tag overlap, least used, trending first). Claude can also read `library.md` and choose by feeling:
topic → mood guide: wins / features / launch → hype or phonk; discipline, losses, revenge trading → dark; routines, growth → uplifting;
POV / humour → cool; personal story → emotional. Add `--use` once the Reel is rendered so the counter avoids repeats.

## 3. Put it on a Tradeframe video (beat-synced)

```
set SONG=C:\igbot\music\<file>.mp3
node <tradeframe-motion>\scripts\render.js <id> <outDir>
```
render.js analyses the song, sets the film's tempo to the song's BPM (scaled into 112-136), starts the song so its drop lands on
the logo drop, fades in/out and normalises to -14 LUFS. Every cut stays on the beat of the real song.

## Copyright, read once

A copyrighted song baked into the MP4 can be muted, limited or blocked by Instagram (rights-holder detection), and downloading
from YouTube is against YouTube's terms. Safer options, in order:
1. Render with SONG (step 3) for the beat sync, then post with `tradeframe-motion/scripts/ig_reel_music.py --query "<same title>"`:
   Instagram swaps in its licensed copy of the same song, shows the title on the Reel and counts it in the trend.
2. Royalty-free / creator-cleared tracks (YouTube Audio Library, NCS, artists' "free for creators" releases) in the library.
3. Baked-in popular song (step 3 as is): Dastan's call, at the account's risk.
