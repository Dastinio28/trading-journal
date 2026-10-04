// Contact-sheet check: node scripts/check.js <video.html> <outDir> [nFrames]
const { chromium } = require('playwright');
(async () => {
  const [html, out, nf = 16] = process.argv.slice(2);
  const br = await chromium.launch(); const p = await br.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(html), { waitUntil: 'load' });
  await p.evaluate(() => document.body.classList.add('export'));
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 20000 }).catch(e => errs.push('not ready'));
  await p.evaluate(() => { const b = document.querySelector('#play'); if (b && b.textContent === 'Pause') b.click(); });
  const dur = await p.evaluate(() => window.__DUR); const st = await p.$('#stage');
  for (let i = 0; i < nf; i++) { const t = (i + .5) / nf * dur; await p.evaluate(x => window.renderAt(x), t); await st.screenshot({ path: `${out}/f${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 70 }); }
  console.log(html, 'dur', dur, 'errs', JSON.stringify(errs.filter(e => !/ERR_/.test(e))));
  await br.close();
})();
