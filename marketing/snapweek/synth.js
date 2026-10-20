// SnapWeek score: warm upbeat house at 120 BPM, 40 s, locked to the film's beat grid.  node synth.js out.wav
const fs = require('fs');
const SR = 44100, BPM = 120, BT = 60 / BPM, DUR = 40.5, N = Math.ceil(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N), RV = new Float32Array(N);
let s0 = 12345; const rnd = () => ((s0 = (s0 * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
const b = n => n * BT, mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function add(t, buf, pan = 0, send = 0) { const i0 = Math.round(t * SR); const gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < buf.length; i++) { const k = i0 + i; if (k < 0 || k >= N) continue; L[k] += buf[i] * gl; R[k] += buf[i] * gr; RV[k] += buf[i] * send; } }
const env = (n, a, d) => i => { const t = i / SR; return t < a ? t / a : Math.exp(-(t - a) / d); };
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
// harmony: Fmaj7 - Em7 - Dm7 - Cmaj7 (2 bars each... 1 bar = 4 beats)
const CH = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], BS = [41, 40, 38, 36];
const chordAt = beat => Math.floor(beat / 4) % 4;
// HOOK b0-8: a hit per phrase, riser into the logo
[0, 2, 4, 6].forEach((x, i) => { add(b(x), kick(1), 0); add(b(x), shutter(.7), .3, .1); add(b(x), pad(CH[i % 4].map(m => m + 12), b(2) - .02, 1.1), 0, .5); add(b(x) + b(1), hat(.6), .2); });
add(b(5), whoosh(b(3), 1.1, true), 0, .3);
// LOGO b8-14
add(b(8), impact(1), 0, .5); add(b(8), pad(CH[0].map(m => m + 12), b(6), 1.3), 0, .6);
for (let x = 8; x < 14; x += .5) if (x % 1) add(b(x), hat(.45), .25);
[0, 3, 7, 12, 7, 3].forEach((iv, j) => add(b(10 + j * .5), pluck(65 + iv, .8, .45), j % 2 ? .4 : -.4, .4));
add(b(13), whoosh(b(1), .9, true), 0, .2);
// MAIN GROOVE b14-66
for (let x = 14; x < 66; x++) {
  add(b(x), kick(x % 1 ? .8 : 1), 0);
  if (x % 2 === 1) add(b(x), clap(.9), 0, .25);
  add(b(x + .5), hat(.55, (x % 4) === 3), .25);
  add(b(x + .25), hat(.25), -.3); add(b(x + .75), hat(.25), -.3);
  const c = chordAt(x - 14);
  [0, .75, 1.5, 2.5, 3].forEach(o => { if (((x - 14) % 4) === 0) add(b(x + o), bass(BS[c] + (o === 2.5 ? 12 : 0), b(.4)), 0); });
  if (((x - 14) % 4) === 0) add(b(x), pad(CH[c].map(m => m + 12), b(4) - .02, .9), 0, .5);
  const arp = CH[c].concat(CH[c].map(m => m + 12)); [0, .5].forEach((o, j) => add(b(x + o), pluck(arp[((x - 14) * 2 + j) % arp.length] + 12, .55, .35), (j ? .5 : -.5), .35));
}
[14, 28, 40, 54].forEach(x => add(b(x) - .35, whoosh(.5, .8, true), 0, .3));
add(b(33), shutter(1.4), 0, .2); add(b(33), impact(.5), 0, .3);
for (let i = 0; i < 8; i++) add(b(54.6) + i * .05, pop(84 + i * 2, .8), (i % 2 ? .3 : -.3), .2);
[60, 62, 64].forEach((x, i) => add(b(x), pop(88 + i * 3, 1), 0, .3));
// OUTRO b66-80
add(b(66) - .35, whoosh(.5, 1, true), 0, .3);
[67, 68.5, 70].forEach((x, i) => { add(b(x), impact(.8), 0, .4); add(b(x), pluck(72 + [0, 4, 7][i], 1, .8), 0, .5); });
for (let x = 71; x < 78; x++) { add(b(x), kick(.9), 0); if (x % 2 === 1) add(b(x), clap(.8), 0, .3); add(b(x + .5), hat(.5), .25); }
add(b(71), pad(CH[0].map(m => m + 12), b(4), 1), 0, .6); add(b(75), pad(CH[3].map(m => m + 12), b(5.5), 1.1), 0, .7);
add(b(74), shutter(.9), .2, .2); add(b(78), impact(.7), 0, .6);
// reverb (Schroeder-ish) on the send
const combs = [1557, 1617, 1491, 1422].map(d => ({ d, buf: new Float32Array(d), i: 0 })), ap = [225, 556].map(d => ({ d, buf: new Float32Array(d), i: 0 }));
for (let k = 0; k < N; k++) { let y = 0; combs.forEach(c => { const o = c.buf[c.i]; c.buf[c.i] = RV[k] * .5 + o * .8; c.i = (c.i + 1) % c.d; y += o; }); y *= .25;
  ap.forEach(a => { const o = a.buf[a.i]; const v = y + o * .5; a.buf[a.i] = v; a.i = (a.i + 1) % a.d; y = o - v * .5; }); L[k] += y * .6; R[k] += y * .6; }
// master: soft clip + fade
let pk = 0; for (let k = 0; k < N; k++) pk = Math.max(pk, Math.abs(L[k]), Math.abs(R[k]));
const out = Buffer.alloc(44 + N * 4); const w = (o, s) => out.write(s, o);
w(0, 'RIFF'); out.writeUInt32LE(36 + N * 4, 4); w(8, 'WAVE'); w(12, 'fmt '); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22); out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); w(36, 'data'); out.writeUInt32LE(N * 4, 40);
for (let k = 0; k < N; k++) { const f = Math.min(1, (N - k) / (SR * 1.2)); [L, R].forEach((C, c) => out.writeInt16LE(Math.round(Math.tanh(C[k] / pk * 1.4) * f * 30000), 44 + k * 4 + c * 2)); }
fs.writeFileSync(process.argv[2] || 'score.wav', out); console.log('peak', pk.toFixed(2));
