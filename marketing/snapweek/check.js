// node check.js <html> <outdir> [n]  -> n frames spread over the film
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const [f, out, n = 16] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const br = await chromium.launch(), p = await br.newPage({ viewport: { width: 1080, height: 1920 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + require('path').resolve(f)); await p.evaluate(() => document.body.classList.add('export')); await p.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  await p.evaluate(() => { const v = document.querySelector('#vp'); v.style.width = '1080px'; document.querySelector('#stage').style.transform = 'none'; });
  const D = await p.evaluate(() => window.__DUR); const ts = process.env.TS ? process.env.TS.split(',').map(Number) : [...Array(+n)].map((_, i) => (i + .5) * D / n);
  for (let i = 0; i < ts.length; i++) { await p.evaluate(t => window.renderAt(t), ts[i]); await (await p.$('#stage')).screenshot({ path: `${out}/f${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 80 }); }
  console.log('errors', JSON.stringify(errs)); await br.close(); })();
