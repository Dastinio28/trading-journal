// Build per-video HTML + timeline JSON from videos.json.  node scripts/build.js [outDir] [id...]
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const { SCENES } = require(ROOT + '/engine/scenes.js');
const STY = require('./style.js');
const VIDEOS = JSON.parse(fs.readFileSync(process.env.VIDEOS_FILE || ROOT + '/videos.json', 'utf8'));

function timeline(V) {
  const BEAT = 60 / V.bpm, slams = [], scenes = [], music = { hook: [], countdown: [], sceneSlams: [], grooves: [], fx: [] };
  let bt = 0;
  V.hook.forEach((h, i) => { const [big, fx, small, cls, d = 1] = h; slams.push({ b: bt, e: bt + d, th: i % 2 ? 'l' : 'd', big, fx: fx || 'stretch', small, cls }); music.hook.push(bt); bt += d; });
  if (V.countdown !== false) ['3', '2', '<span class="g">1</span>'].forEach((n, i) => { slams.push({ b: bt, e: bt + .5, th: (V.hook.length + i) % 2 ? 'l' : 'd', big: n, fx: 'pop', num: 1 }); music.countdown.push(bt); bt += .5; });
  const orb = [bt, bt + .5]; bt += .5; const D = bt; bt = D + 5;
  music.drop = D; music.grooves.push([D, D + 5]);
  const multi = V.scenes.length > 1; let th = 0;
  V.scenes.forEach((key, si) => {
    const S = SCENES[key], ov = (V.over || {})[key] || {}, s0 = bt;
    const sl = ov.slam || S.slam;
    sl.forEach((s, j) => { const small = j === 0 ? (multi ? `${String(si + 1).padStart(2, '0')} / ${String(V.scenes.length).padStart(2, '0')} · ${s.small}` : s.small) : s.small;
      slams.push({ b: bt, e: bt + s.d, th: th++ % 2 ? 'd' : 'l', big: s.big, fx: s.fx, small, cls: s.cls }); music.sceneSlams.push([bt, s.d, s.fx]); bt += s.d; });
    const v = bt, K = V.stretch || (multi ? 1 : 1.6), A = r => +(v + r * K).toFixed(4);
    const subs = S.subs.map((s, i) => [A(s[0]), A(s[1]), (ov.subs && ov.subs[i]) || s[2]]);
    const sc = { key, page: S.page, hash: S.hash, s: s0, v, e: A(S.len),
      cam: S.cam.map(c => ({ b: A(c[0]), f: c[1], s: c[2], rx: c[3], ry: c[4], rz: c[5], e: c[6] })),
      clicks: (S.clicks || []).map(c => [A(c[0]), c[1]]), type: (S.type || []).map(c => [c[0], A(c[1]), A(c[2]), A(c[3])]),
      subs, ann: S.ann.map((a, i) => ({ ...a, text: (ov.ann && ov.ann[i]) || a.text, b: A(a.r0), e: A(a.r1) })), punch: S.punch.map(A),
      t: Object.fromEntries(Object.entries(S.t).map(([k, x]) => [k, A(x)])), curStart: S.curStart, curVis: S.curVis ? S.curVis.map(A) : null,
      zoomBlur: S.zoomBlur ? S.zoomBlur.map(A) : null, burst: S.burst ? [A(S.burst[0]), S.burst[1]] : null };
    scenes.push(sc); music.grooves.push([v, sc.e]); (S.fx || []).forEach(f => music.fx.push([A(f[0]), f[1]]));
    bt = sc.e;
  });
  const O = bt, END = O + 8.5;
  music.outro = O; music.grooves.push([O, O + 5.5]); music.fx.push([O + 4, 'chaching']); music.end = END;
  const cam = scenes.flatMap(s => s.cam); const last = cam[cam.length - 1];
  cam.push({ ...last, b: O + .2, e: 'i3' }, { b: O + 1.2, f: 'C', s: .3, rx: 40, ry: 0, rz: -10, ty: -260, e: 'lin' });
  const prog = multi ? scenes.map(s => [s.s, s.e]) : scenes[0].subs.map(s => [s[0], s[1]]);
  const flash = [[D, .4], ...slams.filter(s => s.b >= D).map(s => [s.b, s.th === 'l' ? .3 : .22])];
  scenes.forEach(s => { for (let i = 1; i < s.cam.length; i++) if (s.cam[i].b === s.cam[i - 1].b) flash.push([s.cam[i].b, .1]); });
  const bursts = [{ b: D, x: 540, y: 760, n: 96, sp: 1750, life: 1.35, sd: 3 }, ...scenes.filter(s => s.burst).map((s, i) => ({ b: s.burst[0], sel: s.burst[1], n: 50, sp: 950, life: .95, sd: 9 + i })), { b: O + 4, sel: '#urlp', n: 44, sp: 900, life: 1.05, sd: 5 }];
  const dur = +(END * BEAT + .9).toFixed(3);
  return { BEAT, slams, orb, D, scenes, O, END, dur, cam, prog, flash, bursts, punch: scenes.flatMap(s => s.punch), music };
}

function build(V, outDir) {
  const tl = timeline(V);
  const b64 = f => fs.readFileSync(f).toString('base64');
  let html = fs.readFileSync(ROOT + '/engine/page.html', 'utf8')
    .replace('%%SORA700%%', b64(ROOT + '/assets/fonts/sora-700.woff2')).replace('%%SORA800%%', b64(ROOT + '/assets/fonts/sora-800.woff2'));
  const style = STY.resolve(V);
  const cfg = { id: V.id, bpm: V.bpm, seed: V.seed, insight: V.insight, tagline: V.tagline, outro: V.outro || ['Your journal.', 'Your edge.'], tl, style };
  const js = fs.readFileSync(ROOT + '/engine/engine.js', 'utf8');
  html = html.replace(/(<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>)/, m => m + STY.css(style).link).replace('<div class="flash" id="flash"></div>', m => m + STY.html(style));
  html = html.replace('%%SCRIPT%%', () => `window.__CFG = ${JSON.stringify(cfg)};\n${js}`).replace('%%TITLE%%', V.title || 'Tradeframe Motion');
  const dir = path.join(outDir, V.id); fs.mkdirSync(dir, { recursive: true });
  const audio = path.join(dir, 'track.mp3');
  html = html.replace('%%AUDIO%%', () => fs.existsSync(audio) ? b64(audio) : '');
  fs.writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify({ bpm: V.bpm, music: V.music, seed: V.seed, tl: tl.music, dur: tl.dur }, null, 1));
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const cap = `${V.caption}\n\n${(V.hashtags || []).map(h => '#' + h).join(' ')}\n`;
  fs.writeFileSync(path.join(dir, 'caption.txt'), cap);
  return { id: V.id, dur: tl.dur };
}
if (require.main === module) {
  const out = path.resolve(process.argv[2] || ROOT + '/../videos'); const only = process.argv.slice(3);
  VIDEOS.filter(v => !only.length || only.includes(v.id)).forEach(v => console.log(JSON.stringify(build(v, out))));
}
module.exports = { timeline, build };
