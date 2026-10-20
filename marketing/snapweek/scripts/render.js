// Full pipeline for one SnapWeek reel: score -> page -> 60 fps frames -> MP4 + cover.  node scripts/render.js <id> [outDir] [fps]
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..'), { build } = require('./build.js'), TLB = require(ROOT + '/engine/timeline.js');
const [id, outArg, fpsArg] = process.argv.slice(2), OUT = path.resolve(outArg || ROOT + '/videos'), FPS = +(fpsArg || 60);
const V = JSON.parse(fs.readFileSync(ROOT + '/videos.json', 'utf8')).find(v => v.id === id); if (!V) { console.error('unknown', id); process.exit(1); }
const dir = path.join(OUT, id); fs.mkdirSync(dir, { recursive: true });
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' });
execFileSync('node', [ROOT + '/scripts/synth.js', id, path.join(dir, 'score.wav')], { stdio: 'inherit' });
ff('-i', path.join(dir, 'score.wav'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', '44100', '-b:a', '192k', path.join(dir, 'score.mp3')); fs.unlinkSync(path.join(dir, 'score.wav'));
build(V, OUT);
(async () => { const fr = path.join(dir, '_frames'); fs.mkdirSync(fr, { recursive: true });
  const br = await chromium.launch(), p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(dir, 'index.html')); await p.evaluate(() => document.body.classList.add('export'));
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
  await p.evaluate(() => { document.querySelector('#vp').style.width = '1080px'; document.querySelector('#stage').style.transform = 'none'; });
  const D = await p.evaluate(() => window.__DUR), st = await p.$('#stage'), N = Math.round(D * FPS);
  const step = t => p.evaluate(t => new Promise(r => { window.renderAt(t); requestAnimationFrame(() => requestAnimationFrame(r)); }), t);
  for (let i = 0; i < N; i++) { await step(i / FPS); await st.screenshot({ path: `${fr}/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 }); }
  const TL = TLB.build(V), sc = TL.scenes[0]; await step((sc.a + 1.8) / TL.SPEED); await st.screenshot({ path: path.join(dir, 'cover.jpg'), type: 'jpeg', quality: 92 });
  await br.close();
  ff('-framerate', String(FPS), '-i', `${fr}/f%05d.jpg`, '-i', path.join(dir, 'score.mp3'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '21', '-preset', 'slow',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', '-f', 'mp4', path.join(dir, `${id}.mp4.part`));
  fs.renameSync(path.join(dir, `${id}.mp4.part`), path.join(dir, `${id}.mp4`));
  fs.rmSync(fr, { recursive: true, force: true }); console.log('done', id, D.toFixed(1) + 's'); })().catch(e => { console.error(id, e); process.exit(1); });
