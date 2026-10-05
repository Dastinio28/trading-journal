# Brief: write Tradeframe motion-Reel concepts (JSON)

Tradeframe (tradeframe.web.app) = free browser trading journal. We make vertical Reels for Instagram @tradeframe.trading:
fast kinetic hook (one slam word per beat) -> logo drop -> 3 to 6 app "scenes" (faithful UI, camera moves, subtitles, hand-drawn callouts) -> outro CTA.
Dark slowed phonk music. Audience: retail day traders (forex, futures, crypto, stocks, prop-firm challengers). ALL ENGLISH. Punchy, Gen-Z trader tone, no financial advice, no promised profits, no fake user testimonials, numbers shown are demo data (don't claim "users made X$").

Reference: every existing video is in marketing/tradeframe-motion/videos.json (fields id, title, hook). Read ALL existing titles and hooks first (`python3 -c "import json;[print(v['id'],v['title'],[h[0] for h in v['hook']]) for v in json.load(open('marketing/tradeframe-motion/videos.json'))]"`) and do NOT duplicate their angle, title or hook. Also avoid duplicates with the other concept files being written in parallel in the same folder (different theme families are assigned to avoid overlap).

## Output
Write a JSON array to the file path given in your task. Each object:
{
 "slug": "kebab-case-short",            // e.g. "fomo-entries" (no number)
 "title": "Short title",                 // <= 40 chars
 "insight": "count|friday|revenge|stops", // what the AI page finds: count = too many trades/day, friday = Friday losses, revenge = trading after 2 losses, stops = moving stops. Pick the one matching the concept.
 "hook": [[html, fx, smallLabel, cssClass]],   // 4 to 7 slams, ONE short word each (<= 10 chars; uppercase). fx in: stretch|shake|snap|echo|glitch. Vary fx. smallLabel optional tiny text above ("" if none). cssClass "" or "negc" (red, for a loss/negative word). Last word wrapped as <span class="g">WORD.</span> (gradient). Use &amp; for &, ’ for apostrophe.
 "scenes": ["..."],                      // 3 to 6 scene keys, no repeats, order tells a story. Keys below.
 "over": { "<sceneKey>": { "slam": [{"small":"...","big":"...","fx":"...","d":1.5}], "subs": ["...", ...], "ann": ["...", ...] } },
          // OPTIONAL per-scene rewrites so text fits YOUR concept. Do it for at least 2 scenes per video (variety matters: 100 videos share 9 scenes).
          // slam: 1 card (or 2) before the scene: small = tiny label (lowercase, 1-3 words), big = 1-2 words uppercase, may use <span class="g">..</span>. d = 1 or 1.5 beats. fx: stretch|shake|snap|echo|glitch.
          // subs: EXACTLY the slot count of that scene (see table), each <= 32 visible chars, one key word wrapped in <g>..</g>. Must match what is on screen in that slot.
          // ann: EXACTLY the slot count, handwritten callout text, <= 18 chars, lowercase casual.
          // tokens allowed in subs/ann: {wr} win rate %, {total} month P&L, {n} trades count, {month}, {left} remaining daily risk.
 "outro": ["Line one.", "Line two."],     // 2 short lines, <= 18 chars each
 "caption": "...",                        // Instagram caption 150-300 chars, ends with a soft CTA like "Free, in your browser. Link in bio."
 "hashtags": ["..."]                      // exactly 15, lowercase, no #, include "tradeframe" and "tradingjournal"
}

## Scenes (key: what's on screen; subs slots in order; ann slots in order)
- add (New Position form, cursor fills a trade): subs 6 = [pick asset, long/short toggle, entry/exit/stop typed, R & P&L auto-computed, emotion chip chosen, saved+toast]; ann 2 = [category auto-filled, R computed]
- dash (Dashboard): subs 5 = [overview, P&L KPI, win-rate KPI, equity curve, discipline score]; ann 4 = [P&L this month, win rate {wr}%, equity new high, rules followed]
- cal (Calendar heat-map): subs 3 = [month colored, best day ring, worst day ring]; ann 2 = [best day, worst day]
- ai (AI Analysis): subs 3 = [AI reads trades, finds the leak (bar chart), one-click rule added]; ann 2 = [the leak bar, 1-click button]
- ck (Pre-trade checklist): subs 2 = [boxes ticked, discipline score rises]; ann 1 = [score +7]
- stats (Advanced statistics): subs 4 = [overview, best setup row, worst weekday, R distribution]; ann 3 = [best setup, worst weekday, winners run]
- risk (Risk calculator): subs 4 = [risk 1% typed, entry/stop typed, position size computed, daily loss limit gauge]; ann 2 = [exact size, {left} left today]
- journal (Trade journal table): subs 4 = [all trades, Losses filter click, search "FOMO", same pattern circled]; ann 2 = [1 click, pattern]
- import (CSV import): subs 4 = [years of trades?, drop CSV, columns mapped, {n} trades imported]; ann 1 = [speed]

Scene count target: average 4 scenes per video (mix of 3, 4, 5, 6). Every concept must have its own clear purpose (one idea a viewer remembers). Write varied, specific, scroll-stopping hooks.
