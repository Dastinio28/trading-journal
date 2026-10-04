(() => {
const CFG = window.__CFG, TL = CFG.tl;
const BEAT = 60 / CFG.bpm, b = n => n * BEAT;
const DUR = TL.dur;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (x, a = 0, z = 1) => Math.min(z, Math.max(a, x));
const lerp = (a, z, p) => a + (z - a) * p;
const E = {
  lin: p => p,
  o3: p => 1 - (1 - p) ** 3,
  o5: p => 1 - (1 - p) ** 5,
  i3: p => p ** 3,
  io3: p => p < .5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2,
  io5: p => p < .5 ? 16 * p ** 5 : 1 - (-2 * p + 2) ** 5 / 2,
  expo: p => p >= 1 ? 1 : 1 - 2 ** (-10 * p),
  back: p => { const c = 1.6, c3 = c + 1; return 1 + c3 * (p - 1) ** 3 + c * (p - 1) ** 2; },
  spring: p => p >= 1 ? 1 : 1 - Math.exp(-6.5 * p) * Math.cos(10 * p),
};
const P = (t, at, dur) => clamp((t - at) / dur);
const M = p => RM ? (p > 0 ? 1 : 0) : p;

function anim(t, o) {
  const { at, dur = .5, ease = E.o5, x = 0, y = 0, s = 1, r = 0, blur = 0,
          outAt = null, outDur = .28, ox = 0, oy = -24, os = 1, oblur = 6 } = o;
  const p = P(t, at, dur), e = ease(p), m = M(e);
  const st = { op: clamp(p * 1.8), x: x * (1 - m), y: y * (1 - m), s: s + (1 - s) * m, r: r * (1 - m), blur: RM ? 0 : blur * (1 - m) };
  if (outAt != null) {
    const q = P(t, outAt, outDur), qe = E.o3(q), qm = M(qe);
    st.op *= 1 - qe; st.x += ox * qm; st.y += oy * qm; st.s *= 1 + (os - 1) * qm; st.blur += RM ? 0 : oblur * qm;
  }
  return st;
}
function put(el, o) {
  const { op = 1, x = 0, y = 0, s = 1, r = 0, blur = 0, sx, sy } = o;
  el.style.opacity = op < .002 ? '0' : op.toFixed(3);
  el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${r.toFixed(2)}deg) scale(${(sx ?? s).toFixed(4)},${(sy ?? s).toFixed(4)})`;
  el.style.filter = blur > .15 ? `blur(${blur.toFixed(1)}px)` : 'none';
}
const show = (el, v) => { const s = v ? 'inherit' : 'hidden'; if (el.style.visibility !== s) el.style.visibility = s; };
const txt = (el, s) => { if (el.textContent !== s) el.textContent = s; };
function pulse(t, from, to, every = 1) {
  const k = Math.floor(t / BEAT / every) * every;
  if (k < from || k > to) return 0;
  return Math.exp(-(t - b(k)) * 9);
}
