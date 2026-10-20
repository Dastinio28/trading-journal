// node render.js [fps]  -> out/SnapWeek Motion.mp4 (+ cover.jpg). Needs Playwright + ffmpeg.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const H = __dirname, FPS = +(process.argv[2] || 60), fr = path.join(H, 'out/_frames'); fs.mkdirSync(fr, { recursive: true });
(async () => { const br = await chromium.launch(), p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(H, 'out/index.html')); await p.evaluate(() => document.body.classList.add('export'));
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  await p.evaluate(() => { document.querySelector('#vp').style.width = '1080px'; document.querySelector('#stage').style.transform = 'none'; });
  const D = await p.evaluate(() => window.__DUR), st = await p.$('#stage'), N = Math.round(D * FPS);
  for (let i = 0; i < N; i++) { await p.evaluate(t => window.renderAt(t), i / FPS); await st.screenshot({ path: `${fr}/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 }); }
  await p.evaluate(() => window.renderAt(11.5)); await st.screenshot({ path: path.join(H, 'out/cover.jpg'), type: 'jpeg', quality: 92 }); await br.close();
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', `${fr}/f%05d.jpg`, '-i', path.join(H, 'out/score.mp3'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', path.join(H, 'out/SnapWeek Motion.mp4')], { stdio: 'inherit' });
  fs.rmSync(fr, { recursive: true, force: true }); console.log('done', N, 'frames'); })();
