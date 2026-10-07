// Append agent-written concepts (see references/concept-brief.md) to videos.json with unique ids, seeds and music,
// durations kept between 21 and 44 s.  node scripts/merge-concepts.js <firstNumber> <file.json...> [--max=N] [--write]
// Files are interleaved (1st of each file, then 2nd...) so the posting queue alternates themes.
const fs = require('fs'), path = require('path'), R = path.resolve(__dirname, '..');
const { SCENES } = require(R + '/engine/scenes.js'); const { timeline } = require(R + '/scripts/build.js');
const args = process.argv.slice(2), write = args.includes('--write'), files = args.filter(a => a.endsWith('.json'));
const MAX = +((args.find(a => a.startsWith('--max=')) || '--max=100000').slice(6));
let n = +args[0]; if (!n || !files.length) { console.error('usage: merge-concepts.js <firstNumber> <file.json...> [--write]'); process.exit(1); }
const V = JSON.parse(fs.readFileSync(R + '/videos.json', 'utf8'));
const groups = files.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
const FX = ['stretch', 'shake', 'snap', 'echo', 'glitch'], INS = ['count', 'friday', 'revenge', 'stops'];
const KEYS = [0, -2, -3, -5, 2, -4, 1, -1, 3, -6, 4, -7], LEADS = ['cowbell', 'bell', 'pluck'], DR = ['half', 'drift'];
const used = new Set(V.map(v => [v.music.riff, v.music.lead, v.music.drums, v.music.key].join()));
const slugs = new Set(V.map(v => v.id.replace(/^\d+-/, ''))), titles = new Set(V.map(v => v.title.toLowerCase()));
const seeds = new Set(V.map(v => v.seed)), out = [], log = [];
const max = Math.max(...groups.map(g => g.length));
for (let i = 0; i < max; i++) for (const g of groups) {
  const c = g[i]; if (!c || out.length >= MAX) continue;
  if (titles.has(String(c.title).toLowerCase())) { log.push(`skip duplicate title: ${c.title}`); continue; }
  const scenes = [...new Set((c.scenes || []).filter(k => SCENES[k]))]; if (scenes.length < 2) { log.push(`skip ${c.slug}: scenes`); continue; }
  const over = {};
  for (const [k, o] of Object.entries(c.over || {})) { if (!scenes.includes(k)) continue; const S0 = SCENES[k], x = {};
    if (Array.isArray(o.subs) && o.subs.length === S0.subs.length) x.subs = o.subs; else if (o.subs) log.push(`${c.slug}: ${k} subs dropped`);
    if (Array.isArray(o.ann) && o.ann.length === S0.ann.length) x.ann = o.ann; else if (o.ann) log.push(`${c.slug}: ${k} ann dropped`);
    if (Array.isArray(o.slam) && o.slam.length) x.slam = o.slam.slice(0, 2).map(s => ({ small: s.small || '', big: s.big, fx: FX.includes(s.fx) ? s.fx : 'snap', d: [1, 1.5].includes(+s.d) ? +s.d : 1.5 }));
    if (Object.keys(x).length) over[k] = x; }
  const hook = (c.hook || []).slice(0, 7).map(h => [h[0], FX.includes(h[1]) ? h[1] : 'stretch', h[2] || '', h[3] === 'negc' ? 'negc' : '']);
  if (hook.length < 3) { log.push(`skip ${c.slug}: hook`); continue; }
  while (seeds.has(n)) n++;
  let m, j = n * 7;
  do { const h = Math.imul(j, 2654435761) >>> 0; m = { key: KEYS[h % 12], riff: (h >>> 4) % 8, lead: LEADS[(h >>> 8) % 3], drums: DR[(h >>> 12) % 2], dark: +(0.7 + ((h >>> 16) % 26) / 100).toFixed(2) }; j++; } while (used.has([m.riff, m.lead, m.drums, m.key].join()));
  used.add([m.riff, m.lead, m.drums, m.key].join());
  let slug = String(c.slug || c.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), k2 = 2; while (slugs.has(slug)) slug = slug.replace(/-\d+$/, '') + '-' + k2++;
  slugs.add(slug); titles.add(String(c.title).toLowerCase()); seeds.add(n);
  const v = { id: `${String(n).padStart(3, '0')}-${slug}`, title: c.title, seed: n, bpm: 127 + ((n * 5) % 14), insight: INS.includes(c.insight) ? c.insight : INS[n % 4],
    hook, scenes, over, outro: c.outro, music: m, caption: c.caption, hashtags: [...new Set((c.hashtags || []).map(h => h.replace(/^#/, '').toLowerCase()))].slice(0, 15) };
  v.stretch = 1; let d = timeline(v).dur;
  while (d < 21 && v.stretch < 1.6) { v.stretch = +(v.stretch + .05).toFixed(2); d = timeline(v).dur; }
  while (d > 44 && v.scenes.length > 3) { const k = v.scenes.pop(); delete v.over[k]; d = timeline(v).dur; }
  while (d > 44 && v.hook.length > 4) { v.hook.splice(-2, 1); d = timeline(v).dur; }
  if (v.stretch === 1) delete v.stretch;
  out.push([v, d]); n++;
}
const durs = out.map(x => x[1]);
console.log(`new ${out.length}  avg ${(durs.reduce((a, b) => a + b, 0) / (durs.length || 1)).toFixed(1)} s  min ${Math.min(...durs)}  max ${Math.max(...durs)}`);
log.forEach(l => console.log('  ' + l));
out.forEach(([v, d]) => console.log(v.id, d, v.scenes.join(',')));
if (write) { fs.writeFileSync(R + '/videos.json', JSON.stringify([...V, ...out.map(x => x[0])], null, 1)); console.log('videos.json:', V.length + out.length); }
