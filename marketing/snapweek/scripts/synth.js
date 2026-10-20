// SnapWeek reel score: warm house, synthesized, events locked to the video timeline (engine/timeline.js).
// node scripts/synth.js <videos.json id> <out.wav>
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), { build } = require(ROOT + '/engine/timeline.js');
const [id, outWav] = process.argv.slice(2);
const V = JSON.parse(fs.readFileSync(ROOT + '/videos.json', 'utf8')).find(v => v.id === id); const TL = build(V);
const SP = 1 / TL.SPEED, SR = 44100, DUR = (TL.CLOCK + .5) * SP, N = Math.ceil(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N), RV = new Float32Array(N);
let s0 = 12345 + V.seed * 7919; const rnd = () => ((s0 = (s0 * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
const KEY = [0, -3, 2, -5, 4, -2, 1, -4, 3, -1][V.seed % 10], BPM = [120, 116, 124, 118, 122, 114, 126, 120, 118, 124][V.seed % 10], BT = 60 / BPM;
const FEEL = ['four', 'half', 'four', 'break'][V.seed % 4], LEAD = ['pluck', 'bell', 'pluck', 'marimba'][(V.seed >> 1) % 4];
const mtof = m => 440 * Math.pow(2, (m + KEY - 69) / 12);
function add(t, buf, pan = 0, send = 0) { const i0 = Math.round(t * SP * SR); const gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < buf.length; i++) { const k = i0 + i; if (k < 0 || k >= N) continue; L[k] += buf[i] * gl; R[k] += buf[i] * gr; RV[k] += buf[i] * send; } }
function kick(g = 1) { const n = SR * .45, o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = 48 + 110 * Math.exp(-t * 32); ph += 2 * Math.PI * f / SR; o[i] = Math.tanh(1.6 * Math.sin(ph) * Math.exp(-t * 6.5)) * g; } return o; }
function clap(g = 1) { const n = SR * .35, o = new Float32Array(n); let lp = 0, hp = 0; for (let i = 0; i < n; i++) { const t = i / SR; const e = (t < .03 ? (Math.sin(t * 330) > 0 ? 1 : .5) : 1) * Math.exp(-t * 14); const x = rnd(); hp = x - lp; lp += .25 * (x - lp); o[i] = hp * e * .7 * g; } return o; }
function hat(g = 1, open = 0) { const n = SR * (open ? .3 : .07), o = new Float32Array(n); let lp = 0; for (let i = 0; i < n; i++) { const x = rnd(); lp += .6 * (x - lp); o[i] = (x - lp) * Math.exp(-i / SR * (open ? 9 : 55)) * .5 * g; } return o; }
function pluck(m, g = 1, len = .5) { const n = Math.floor(SR * len), o = new Float32Array(n), f = mtof(m); let p1 = 0, p2 = 0, lp = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; p1 += f / SR; p2 += f * 1.005 / SR; const saw = (p1 % 1) * 2 - 1 + ((p2 % 1) * 2 - 1); const cut = .05 + .5 * Math.exp(-t * 14); lp += cut * (saw - lp); o[i] = lp * Math.exp(-t * 5) * .22 * g; } return o; }
function pad(ms, len, g = 1) { const n = Math.floor(SR * len), o = new Float32Array(n); const ph = ms.map(() => [rnd(), rnd()]); let lp = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; let x = 0; ms.forEach((m, j) => { const f = mtof(m); ph[j][0] += f / SR; ph[j][1] += f * 1.007 / SR; x += ((ph[j][0] % 1) * 2 - 1) + ((ph[j][1] % 1) * 2 - 1); });
    lp += .03 * (x - lp); const e = Math.min(1, t / .08) * Math.min(1, (len - t) / .25); o[i] = lp * e * .07 * g; } return o; }
function bass(m, len, g = 1) { const n = Math.floor(SR * len), o = new Float32Array(n), f = mtof(m); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; ph += f / SR; const x = Math.sin(2 * Math.PI * ph) + .3 * Math.sin(4 * Math.PI * ph); o[i] = Math.tanh(1.4 * x) * Math.min(1, t / .01) * Math.min(1, (len - t) / .04) * .32 * g; } return o; }
function shutter(g = 1) { const n = SR * .18, o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = (rnd() * Math.exp(-t * 90) + (t > .07 ? rnd() * Math.exp(-(t - .07) * 70) * .8 : 0)) * .9 * g; } return o; }
function whoosh(len = .6, g = 1, rev = false) { const n = Math.floor(SR * len), o = new Float32Array(n); let lp = 0; for (let i = 0; i < n; i++) { const p = i / n, q = rev ? p : 1 - p; const x = rnd(); lp += (.02 + .4 * q * q) * (x - lp); o[i] = lp * Math.sin(Math.PI * p) * .6 * g; } return o; }
function impact(g = 1) { const k = kick(1.3), n = SR * 1.6, o = new Float32Array(n); let lp = 0; for (let i = 0; i < n; i++) { const t = i / SR, x = rnd(); lp += .05 * (x - lp); o[i] = (i < k.length ? k[i] : 0) + lp * Math.exp(-t * 2.2) * .9; o[i] *= g; } return o; }
function pop(m, g = 1) { const n = SR * .12, o = new Float32Array(n), f = mtof(m); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = Math.sin(2 * Math.PI * f * t * (1 + 2 * Math.exp(-t * 60))) * Math.exp(-t * 30) * .35 * g; } return o; }

function bell(m, g = 1, len = .9) { const n = Math.floor(SR * len), o = new Float32Array(n), f = mtof(m); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = (Math.sin(2 * Math.PI * f * t) + .4 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 6)) * Math.exp(-t * 3.2) * .16 * g; } return o; }
function marimba(m, g = 1) { const n = Math.floor(SR * .5), o = new Float32Array(n), f = mtof(m); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = (Math.sin(2 * Math.PI * f * t) + .25 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t * 30)) * Math.exp(-t * 9) * .3 * g; } return o; }
const lead = (m, g, len) => LEAD === 'bell' ? bell(m, g) : LEAD === 'marimba' ? marimba(m, g) : pluck(m, g, len);
const CH = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], BS = [41, 40, 38, 36];
const PROG = [[0, 1, 2, 3], [2, 3, 0, 1], [0, 2, 1, 3], [3, 0, 1, 2]][V.seed % 4];
const boing = (t, m = 76) => { add(t, pop(m, 1.1), 0, .3); add(t + .08, pop(m + 7, .8), 0, .3); };
// intro
const T0 = TL.T0, OUT = TL.OUTRO;
add(0, pad(CH[PROG[0]].map(m => m + 12), TL.quick ? T0 + .1 : 3.9, 1.0), 0, .6);
const motif = [72, 76, 79, 83, 79, 76, 74, 77, 81].map(m => m + (V.seed % 3) * 2 - 2);
for (let j = 0; j * .5 < (TL.quick ? T0 : 3.6); j++) add(j * .5, lead(motif[j % motif.length], .6, .6), j % 2 ? .4 : -.4, .5);
add(TL.quick ? Math.max(0, T0 - 2) : 1.6, whoosh(TL.quick ? 2 : 2.2, .9, true), 0, .3);
if (!TL.quick) { add(3.8, pad(CH[PROG[0]].map(m => m + 12), 3.0, 1.2), 0, .6); for (let x = 4; x < 6.6; x += .5) add(x + .25, hat(.4), .25); }
// groove T0 .. OUT
for (let k = 0; T0 + k * BT < OUT - .1; k++) { const x = T0 + k * BT, bar = Math.floor(k / 4), c = PROG[bar % 4];
  if (FEEL === 'half') { if (k % 4 === 0) add(x, kick(1), 0); if (k % 4 === 2) add(x, clap(.95), 0, .3); }
  else if (FEEL === 'break') { if (k % 4 === 0 || k % 8 === 3) add(x, kick(.95), 0); if (k % 4 === 2) add(x, clap(.9), 0, .25); add(x + BT * .75, kick(.5), 0); }
  else { add(x, kick(.95), 0); if (k % 2 === 1) add(x, clap(.85), 0, .25); }
  add(x + BT / 2, hat(.5, k % 4 === 3), .25); add(x + BT / 4, hat(.2), -.3); add(x + BT * .75, hat(.2), -.3);
  if (k % 4 === 0) { add(x, pad(CH[c].map(m => m + 12), BT * 4 - .02, .85), 0, .5); [0, .75, 1.5, 2.5, 3].forEach(o => add(x + o * BT, bass(BS[c] + (o === 2.5 ? 12 : 0), BT * .4), 0)); }
  const arp = CH[c].concat(CH[c].map(m => m + 12)); [0, .5].forEach((o, j) => add(x + o * BT, lead(arp[(k * 2 + j) % arp.length] + 12, .5, .35), j ? .5 : -.5, .35)); }
// timeline events
TL.events.forEach(([t, k], i) => { if (k === 'whoosh') add(t, whoosh(.7, .75, true), 0, .3); if (k === 'impact') add(t, impact(.8), 0, .5); if (k === 'pop') add(t, pop(84 + (i % 5) * 2, .9), i % 2 ? .3 : -.3, .3); if (k === 'boing') boing(t); if (k === 'swish') add(t, whoosh(.45, .5, false), 0, .2); });
// outro
for (let k = 0; OUT + .2 + k * BT < TL.CLOCK - 1; k++) { const x = OUT + .2 + k * BT; add(x, kick(.8), 0); if (k % 2) add(x, clap(.7), 0, .3); add(x + BT / 2, hat(.45), .25); }
add(OUT + .2, pad(CH[PROG[0]].map(m => m + 12), 2.4, 1), 0, .6); add(OUT + 2.6, pad(CH[PROG[3]].map(m => m + 12), 4.2, 1.1), 0, .7);
[0, 4, 7, 12].forEach((iv, j) => add(OUT + 2.7 + j * .12, lead(72 + iv, .8, .9), 0, .5));
// reverb + master
const combs = [1557, 1617, 1491, 1422].map(d => ({ d, buf: new Float32Array(d), i: 0 })), ap = [225, 556].map(d => ({ d, buf: new Float32Array(d), i: 0 }));
for (let k = 0; k < N; k++) { let y = 0; combs.forEach(c => { const o = c.buf[c.i]; c.buf[c.i] = RV[k] * .5 + o * .8; c.i = (c.i + 1) % c.d; y += o; }); y *= .25;
  ap.forEach(a => { const o = a.buf[a.i]; const v = y + o * .5; a.buf[a.i] = v; a.i = (a.i + 1) % a.d; y = o - v * .5; }); L[k] += y * .6; R[k] += y * .6; }
let pk = 0; for (let k = 0; k < N; k++) pk = Math.max(pk, Math.abs(L[k]), Math.abs(R[k]));
const out = Buffer.alloc(44 + N * 4); const w = (o, s) => out.write(s, o);
w(0, 'RIFF'); out.writeUInt32LE(36 + N * 4, 4); w(8, 'WAVE'); w(12, 'fmt '); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22); out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); w(36, 'data'); out.writeUInt32LE(N * 4, 40);
for (let k = 0; k < N; k++) { const f = Math.min(1, (N - k) / (SR * 1.2)); [L, R].forEach((C, c) => out.writeInt16LE(Math.round(Math.tanh(C[k] / pk * 1.4) * f * 30000), 44 + k * 4 + c * 2)); }
fs.writeFileSync(outWav, out); console.log(JSON.stringify({ id, key: KEY, bpm: BPM, feel: FEEL, lead: LEAD }));
