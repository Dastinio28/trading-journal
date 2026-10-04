// Full pipeline for one video: build -> synth score -> HTML with audio -> 60 fps frames -> MP4 + cover.
// node scripts/render.js <id> [outDir] [fps]
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const { build } = require('./build.js');
const [id, outArg, fpsArg] = process.argv.slice(2);
const OUT = path.resolve(outArg || ROOT + '/../videos'), FPS = +(fpsArg || 60);
const V = JSON.parse(fs.readFileSync(ROOT + '/videos.json', 'utf8')).find(v => v.id === id);
if (!V) { console.error('unknown id', id); process.exit(1); }
const dir = path.join(OUT, id), ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' });
build(V, OUT);
const wav = path.join(dir, 'score.wav');
execFileSync('node', [ROOT + '/scripts/synth.js', path.join(dir, 'timeline.json'), wav], { stdio: 'inherit' });
const cut = Math.round(9000 - 4000 * (V.music.dark || .7));
ff('-i', wav, '-af', `lowpass=f=${cut},vibrato=f=0.35:d=0.025,bass=g=3:f=60,loudnorm=I=-11:TP=-1:LRA=8`, '-ar', '44100', '-b:a', '192k', path.join(dir, 'track.mp3'));
fs.unlinkSync(wav);
const { dur } = build(V, OUT);
(async () => {
  const { chromium } = require('playwright');
  const frames = path.join(dir, '_frames'); fs.mkdirSync(frames, { recursive: true });
  const br = await chromium.launch(); const p = await br.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(dir, 'index.html'), { waitUntil: 'load' });
  await p.evaluate(() => document.body.classList.add('export'));
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  await p.evaluate(() => { const b = document.querySelector('#play'); if (b.textContent === 'Pause') b.click(); });
  await p.waitForTimeout(300);
  const st = await p.$('#stage'), N = Math.ceil(dur * FPS);
  for (let i = 0; i < N; i++) { await p.evaluate(t => window.renderAt(t), i / FPS); await st.screenshot({ path: `${frames}/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 90 }); }
  const coverT = await p.evaluate(() => { const s = window.__CFG.tl.scenes[0], u = s.subs[1] || s.subs[0]; return (u[0] + (u[1] - u[0]) * .7) * 60 / window.__CFG.bpm; });
  await p.evaluate(t => window.renderAt(t), coverT); await st.screenshot({ path: path.join(dir, 'cover.jpg'), type: 'jpeg', quality: 92 });
  await br.close();
  ff('-framerate', String(FPS), '-i', `${frames}/f%05d.jpg`, '-i', path.join(dir, 'track.mp3'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-profile:v', 'high',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', '-f', 'mp4', path.join(dir, `${id}.mp4.part`));
  fs.renameSync(path.join(dir, `${id}.mp4.part`), path.join(dir, `${id}.mp4`));
  fs.rmSync(frames, { recursive: true, force: true });
  console.log('done', id, dur.toFixed(1) + 's');
})().catch(e => { console.error(id, e); process.exit(1); });
