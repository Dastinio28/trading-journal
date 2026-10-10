/* ---------------- per-video style layer (karaoke captions, film grain, HUD) ---------------- */
const ST = CFG.style || {};
const grainC = $('#grain'), gctx = grainC ? grainC.getContext('2d') : null, GT = [];
if (gctx && ST.grain) for (let k = 0; k < 6; k++) { const im = gctx.createImageData(540, 960); let s = (k + 1) * 9973;
  for (let i = 0; i < im.data.length; i += 4) { s = (s * 1103515245 + 12345) & 0x7fffffff; const v = (s >> 16) & 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } GT.push(im); }
const hudTc = $('#hud-tc'), hudRec = $('#hud-rec');
const renderBase = render;
render = function (t) {
  renderBase(t);
  const tb = t / BEAT;
  if (ST.caps === 'karaoke') SUBS.forEach(([a, z], i) => { const S = subEls[i]; if (tb < a || tb >= z) return;
    const n = S.ws.length, k = Math.min(n - 1, Math.floor((tb - a) / Math.max(.001, z - a) * n * 1.15));
    S.ws.forEach((w, j) => w.classList.toggle('kon', j === k)); });
  if (gctx && GT.length) { gctx.putImageData(GT[Math.floor(t * 24) % GT.length], 0, 0); }
  if (hudTc) { const f = Math.floor(t * 30), s = Math.floor(t); hudTc.textContent = `00:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f % 30).padStart(2, '0')}`;
    hudRec.style.opacity = Math.floor(t * 1.6) % 2 ? .25 : 1; }
};
