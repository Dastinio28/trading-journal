// Re-capture cover.jpg for rendered videos at a moment where the first scene's 2nd subtitle is fully on screen.
// node scripts/covers.js <outDir> [id...]   (needs <id>/index.html from a render)
const fs = require('fs'), path = require('path');
const OUT = path.resolve(process.argv[2]); const only = process.argv.slice(3);
const ids = fs.readdirSync(OUT).filter(d => fs.existsSync(path.join(OUT, d, 'index.html')) && (!only.length || only.includes(d)));
(async () => {
  const { chromium } = require('playwright'); const br = await chromium.launch();
  const p = await br.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1080, height: 1920 } });
  for (const id of ids) {
    await p.goto('file://' + path.join(OUT, id, 'index.html'), { waitUntil: 'load' });
    await p.evaluate(() => document.body.classList.add('export'));
    await p.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
    await p.evaluate(() => { const b = document.querySelector('#play'); if (b.textContent === 'Pause') b.click(); });
    const t = await p.evaluate(() => { const s = window.__CFG.tl.scenes[0], u = s.subs[1] || s.subs[0]; return (u[0] + (u[1] - u[0]) * .7) * 60 / window.__CFG.bpm; });
    await p.evaluate(t => window.renderAt(t), t); await p.waitForTimeout(150); await p.evaluate(t => window.renderAt(t), t);
    await (await p.$('#stage')).screenshot({ path: path.join(OUT, id, 'cover.jpg'), type: 'jpeg', quality: 92 });
    console.log('cover', id);
  }
  await br.close();
})();
