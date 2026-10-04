/* ---------------- clock, audio, controls ---------------- */
const aud = $('#aud'), playBtn = $('#play'), scrub = $('#scrub'), time = $('#time'), soundBtn = $('#sound');
scrub.max = DUR;
let t = 0, playing = !document.body.classList.contains('export'), last = performance.now(), hold = 0, soundOn = false, ready0 = false;
const k = () => vp.clientWidth / 1080;
const fit = () => { stage.style.transform = `scale(${k()})`; };
new ResizeObserver(fit).observe(vp); fit();
const ui = () => { scrub.value = t; time.textContent = t.toFixed(1) + ' / ' + DUR.toFixed(1) + ' s'; playBtn.textContent = playing ? 'Pause' : 'Play'; soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off'; soundBtn.classList.toggle('on', soundOn); soundBtn.setAttribute('aria-pressed', soundOn); };
function syncAudio(force) {
  if (!soundOn) { if (!aud.paused) aud.pause(); return; }
  if (!playing || t >= DUR) { if (!aud.paused) aud.pause(); return; }
  if (force || Math.abs(aud.currentTime - t) > .12) { try { aud.currentTime = t; } catch (e) {} }
  if (aud.paused) aud.play().catch(() => { soundOn = false; ui(); });
}
function tick(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (playing && ready0) {
    if (t >= DUR) { hold += dt; if (hold > 1.2) { t = 0; hold = 0; syncAudio(true); } }
    else if (soundOn && !aud.paused && aud.currentTime > 0) t = Math.min(DUR, aud.currentTime);
    else t = Math.min(DUR, t + dt);
    render(t); ui(); syncAudio(false);
  }
  requestAnimationFrame(tick);
}
playBtn.addEventListener('click', () => { if (t >= DUR) t = 0; playing = !playing; syncAudio(true); ui(); });
$('#replay').addEventListener('click', () => { t = 0; hold = 0; playing = true; render(t); syncAudio(true); ui(); });
soundBtn.addEventListener('click', () => { soundOn = !soundOn; if (soundOn && !playing) playing = true; syncAudio(true); ui(); });
scrub.addEventListener('input', () => { playing = false; t = +scrub.value; render(t); syncAudio(true); ui(); });

function measureBursts() {
  const sr = stage.getBoundingClientRect(), kk = k();
  BURSTS.forEach(B => { if (!B.sel) { B.xy = [B.x, B.y]; return; } render(b(B.b)); const r = $(B.sel).getBoundingClientRect(); B.xy = [(r.left + r.width / 2 - sr.left) / kk, (r.top + r.height / 2 - sr.top) / kk]; });
}
let inited = false;
function init() {
  if (inited) return; inited = true;
  layout(); measureBursts(); render(t); ui(); ready0 = true;
  window.__ready = true;
}
window.renderAt = x => { t = x; render(x); };
window.__DUR = DUR;
document.fonts.ready.then(() => setTimeout(init, 60)); setTimeout(init, 3500);
render(0); requestAnimationFrame(tick);
})();
