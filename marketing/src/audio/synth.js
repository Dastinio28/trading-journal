// Tradeframe phonk: drift/Memphis phonk at the film's tempo (BEAT 0.452 s), with finance FX. Pure JS, writes 16-bit stereo WAV.
const fs = require('fs');
const SR = 44100, BEAT = 0.452, DUR = 70 * BEAT + 1.6, N = Math.ceil(DUR * SR);
const L = new Float32Array(N), R = new Float32Array(N), SEND = new Float32Array(N), SIDE = new Float32Array(N).fill(1);
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 * 2 - 1;
const b = n => n * BEAT, S = t => Math.floor(t * SR);
const hz = semi => 440 * Math.pow(2, semi / 12); // semitones from A4
const E = { E1: hz(-41), G1: hz(-38), A1: hz(-36), B1: hz(-34), C2: hz(-33), D2: hz(-31), E2: hz(-29) };
function add(t, len, fn, pan = 0, send = 0, duck = true) {
  const s0 = S(t), n = Math.min(S(len), N - s0); const gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n; i++) { const v = fn(i / SR) * (duck ? SIDE[s0 + i] : 1); L[s0 + i] += v * gl * 1.414; R[s0 + i] += v * gr * 1.414; SEND[s0 + i] += v * send; }
}
// one-pole helpers inside closures
const hp = () => { let x1 = 0, y1 = 0; return (x, a = .9) => { const y = a * (y1 + x - x1); x1 = x; y1 = y; return y; }; };
const lp = () => { let y = 0; return (x, a = .2) => (y += a * (x - y)); };
const bp = (f, q) => { // RBJ biquad bandpass
  const w = 2 * Math.PI * f / SR, al = Math.sin(w) / (2 * q), a0 = 1 + al;
  const b0 = al / a0, b2 = -al / a0, a1 = -2 * Math.cos(w) / a0, a2 = (1 - al) / a0; let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return x => { const y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
};
const sat = (x, d) => Math.tanh(x * d) / Math.tanh(d);

/* ---------- instruments ---------- */
function kick(t, g = 1) {
  add(t, .5, x => { const f = 45 + 120 * Math.exp(-x * 30); const ph = 2 * Math.PI * (45 * x + 120 * (1 - Math.exp(-x * 30)) / 30);
    return g * sat(Math.sin(ph) * Math.exp(-x * 7) * 1.4 + (x < .004 ? rnd() * .5 : 0), 2) * .9; }, 0, 0, false);
  // sidechain duck
  const s0 = S(t); for (let i = 0; i < S(.32) && s0 + i < N; i++) SIDE[s0 + i] = Math.min(SIDE[s0 + i], .35 + .65 * Math.min(1, i / S(.32)) ** 1.5);
}
function bass808(t, f, len, g = 1, glideTo = null) {
  add(t, len + .2, x => { const ff = glideTo ? f + (glideTo - f) * Math.min(1, Math.max(0, (x - len * .55) / (len * .35))) : f;
    const env = Math.min(1, x / .004) * (x < len ? Math.exp(-x * .9) : Math.exp(-len * .9) * Math.exp(-(x - len) * 25));
    return g * sat(Math.sin(2 * Math.PI * ff * x + 0) * env, 3.2) * .55; }, 0, 0, false);
}
// phase-accurate 808 with glide
function bass(t, f, len, g = 1, glideTo = null) {
  let ph = 0; add(t, len + .15, x => { const ff = glideTo ? f + (glideTo - f) * Math.min(1, Math.max(0, (x - len * .5) / (len * .4))) : f; ph += 2 * Math.PI * ff / SR;
    const env = Math.min(1, x / .003) * (x < len ? .55 + .45 * Math.exp(-x * 2.2) : (.55 + .45 * Math.exp(-len * 2.2)) * Math.exp(-(x - len) * 30));
    return g * (sat(Math.sin(ph) * env, 8) * .42 + Math.sin(ph * .5) * env * .18); }, 0, 0, false);
}
function clap(t, g = 1) {
  const f = bp(1500, .9), f2 = bp(220, 2);
  add(t, .45, x => { const e = (x < .03 ? (Math.exp(-((x % .011)) * 300)) : Math.exp(-(x - .03) * 14)); return g * (f(rnd()) * e * 2.2 + f2(rnd()) * Math.exp(-x * 30) * 1.2) * .5; }, 0, .35);
}
function hat(t, g = 1, open = false, pan = .25) {
  const h = hp(); add(t, open ? .3 : .06, x => g * h(rnd(), .97) * Math.exp(-x * (open ? 12 : 70)) * .22, pan, .05);
}
function cowbell(t, semi, g = 1, len = .32, pan = 0) {
  const f = 329.63 * Math.pow(2, semi / 12), f1 = bp(f * 1.2, 1.4); let p1 = 0, p2 = 0;
  add(t, len, x => { p1 += f / SR; p2 += f * 1.482 / SR; const sq = ((p1 % 1) < .5 ? 1 : -1) * .6 + ((p2 % 1) < .5 ? 1 : -1) * .4;
    const env = Math.min(1, x / .002) * (Math.exp(-x * 9) * .8 + Math.exp(-x * 40) * .2); return g * sat(f1(sq) * env * 2.4, 5) * .5; }, pan, .3);
}
function pad(t, len, semis, g = 1) {
  const l1 = lp(); const fr = semis.flatMap(s => [hz(s) * .997, hz(s) * 1.004]); const ph = fr.map(() => Math.random());
  add(t, len, x => { let v = 0; fr.forEach((f, i) => { ph[i] += f / SR; v += (ph[i] % 1) * 2 - 1; });
    const env = Math.min(1, x / .6) * Math.min(1, (len - x) / .6); return g * l1(v / fr.length, .025) * env * .5; }, 0, .4);
}
function bell(t, g = 1, base = 2093) { // cash register "ching"
  add(t, 1.6, x => g * ([1, 1.26, 1.5, 2.0, 2.52].reduce((a, r, i) => a + Math.sin(2 * Math.PI * base * r * x) * Math.exp(-x * (3 + i * 1.6)) / (i + 1), 0)) * .22, .15, .5);
}
function chaching(t, g = 1) { // drawer + bell
  const f = bp(900, 1.2); add(t, .12, x => g * f(rnd()) * Math.exp(-x * 40) * .9, -.2, .1);
  const f2 = bp(3000, 3); add(t + .035, .05, x => g * f2(rnd()) * Math.exp(-x * 90) * .8, -.1, .1);
  bell(t + .09, g, 2093); bell(t + .09, g * .7, 2637);
}
function coin(t, g = 1, f = 4200) { add(t, .35, x => g * (Math.sin(2 * Math.PI * f * x) + .5 * Math.sin(2 * Math.PI * f * 1.53 * x)) * Math.exp(-x * 18) * .12, (rnd()) * .6, .3); }
function tick(t, g = 1) { const f = bp(5200, 2); add(t, .02, x => g * f(rnd()) * Math.exp(-x * 400) * 1.2, .3, 0); }
function beep(t, g = 1, f = 1568) { add(t, .07, x => g * Math.sign(Math.sin(2 * Math.PI * f * x)) * Math.exp(-x * 45) * .05, -.3, .2); }
function counter(t, len, g = 1) { for (let x = 0; x < len; x += 1 / 38) tick(t + x, g * (.6 + .4 * Math.random())); }
function impact(t, g = 1) { kick(t, 1.1 * g); const l1 = lp(); add(t, 2.2, x => g * l1(rnd(), .06) * Math.exp(-x * 1.8) * .7, 0, .6, false);
  const h = hp(); add(t, 1.4, x => g * h(rnd(), .985) * Math.exp(-x * 2.8) * .09, 0, .4, false); }
function riser(t, len, g = 1) { const f = bp(400, 2); let ph = 0;
  add(t, len, x => { const p = x / len; ph += (200 + 1800 * p * p) / SR; return g * (rnd() * .5 * p * p + Math.sin(2 * Math.PI * ph) * .25 * p) * .5; }, 0, .5, false); }

/* ---------- song ---------- */
const MEL = [0, null, 0, 3, null, 0, 5, null, 3, null, 0, null, -2, null, 0, null, 0, null, 0, 3, null, 0, 7, null, 5, null, 3, null, 2, null, -2, null];
const ROOTS = [[0, E.E1, 1.6, E.E1], [1.75, E.E1, .5], [2.5, E.G1, .7], [3.5, E.E1, .4], [4, E.C2, 1.4], [5.5, E.C2, .4], [6, E.D2, 1.2, E.B1], [7.5, E.B1, .45]];
const FULL = [[8, 13], [15.5, 26], [27.5, 35.5], [36.5, 43], [44.5, 51], [52, 57.5], [57.5, 64]];
const inFull = bb => FULL.some(([a, z]) => bb >= a && bb < z);
function groove(a, z, variant = 0) {
  for (let bb = a; bb < z; bb += .25) {
    const st = Math.round(((bb - 8) % 8 + 8) % 8 * 4); const s16 = st % 16; const t = b(bb);
    if ([0, 10].includes(s16) || (s16 === 3 && st >= 16) || (variant && s16 === 14 && st >= 16)) kick(t, s16 === 0 ? 1.15 : .95);
    if (s16 === 8) clap(t, 1.15);
    if (s16 % 2 === 0) hat(t, s16 % 4 === 2 ? .7 : .45);
    if (st % 16 === 14 && Math.floor(st / 16) === 1) { for (let k = 1; k < 4; k++) hat(t + k * BEAT / 12, .5, false, -.2); }
    if (s16 === 7 && variant) hat(t, .7, true, -.3);
    const m = MEL[st]; if (m != null) cowbell(t, m + (variant === 2 ? 12 : 0), st % 2 ? .8 : 1, .3, st % 4 === 2 ? .35 : -.15);
  }
  for (let base = a - ((a - 8) % 8 + 8) % 8; base < z; base += 8) ROOTS.forEach(([o, f, len, gl]) => { const bb = base + o; if (bb >= a && bb < z) bass(b(bb), f, Math.min(len * BEAT, b(z) - b(bb)), 1, gl ? gl : null); });
}
// intro: slams hit on each beat, dark pad + filtered cowbell + ticker
pad(0, b(7.5), [-29, -26, -22], 1.1);
[0, 1, 2, 3, 4, 5].forEach(bb => { kick(b(bb), .95); bass(b(bb), [E.E1, E.E1, E.G1, E.E1, E.C2, E.D2][bb], .38, .8); });
[3.5].forEach(bb => clap(b(bb), .5));
for (let bb = 0; bb < 7.5; bb += .25) { const m = MEL[Math.round(bb * 4) % 32]; if (m != null) cowbell(b(bb), m, .28, .25, 0); }
for (let bb = 0; bb < 6; bb += .5) tick(b(bb) + BEAT * .25, .5);
[6, 6.5, 7].forEach((bb, i) => { clap(b(bb), .9); beep(b(bb), .9, 1046 * (1 + i * .25)); });
riser(b(4), b(3.5), 1);
// drop
impact(b(8), 1); chaching(b(8) + .02, .8);
groove(8, 13, 0);
// slam LOG IT / counter
impact(b(13), .8); bass(b(13), E.E1, b(1.4), 1, E.B1); counter(b(14.5), b(1), .5); riser(b(14.4), b(1.1), .7); kick(b(14.5), .9);
groove(15.5, 26, 1);
chaching(b(25), 1);
impact(b(26), .9); bass(b(26), E.E1, b(1.3), 1, E.E2); for (let k = 0; k < 8; k++) coin(b(26) + k * .07, .8, 3800 + k * 250);
groove(27.5, 35.5, 2);
[27.75, 28.25, 28.75, 29.25, 29.75].forEach(bb => beep(b(bb), .6, 2093));
impact(b(35.5), .8); bass(b(35.5), E.C2, b(.9), 1, E.E1);
groove(36.5, 43, 1);
impact(b(43), 1); for (let k = 0; k < 6; k++) kick(b(43) + k * BEAT / 4, .55 - k * .06); bass(b(43), E.E1, b(1.4), 1, E.D2);
groove(44.5, 51, 2);
chaching(b(49.75), .7);
impact(b(51), .8); bass(b(51), E.E1, b(.9), 1, E.B1);
groove(52, 57.5, 2);
for (let i = 0; i < 6; i++) coin(b(52.5 + i * .5), .9, 3600 + i * 300);
chaching(b(55), .8);
groove(57.5, 64, 1);
impact(b(58), .7); chaching(b(62), 1);
pad(b(62), b(8) + 1, [-29, -26, -22, -17], 1);
for (let bb = 64; bb < 70; bb += .5) { const m = MEL[Math.round((bb - 8) * 4) % 32]; if (m != null) cowbell(b(bb), m, .35 * (1 - (bb - 64) / 6), .3, 0); }
bass(b(64), E.E1, b(4), .9);

/* ---------- reverb send (Schroeder) + master ---------- */
const combs = [1557, 1617, 1491, 1422].map(d => ({ d, buf: new Float32Array(d), i: 0 })), aps = [225, 556].map(d => ({ d, buf: new Float32Array(d), i: 0 }));
for (let n = 0; n < N; n++) {
  let x = SEND[n] * .42, y = 0;
  for (const c of combs) { const o = c.buf[c.i]; c.buf[c.i] = x + o * .86; c.i = (c.i + 1) % c.d; y += o; }
  for (const a of aps) { const o = a.buf[a.i]; const v = y + o * -.5; a.buf[a.i] = v; y = o + v * .5; a.i = (a.i + 1) % a.d; }
  L[n] += y * .5; R[n] += y * .48;
}
// ping-pong delay on the right for width (3/16 note)
const dl = S(BEAT * .75); for (let n = dl; n < N; n++) { R[n] += L[n - dl] * .08; }
let peak = 0; for (let n = 0; n < N; n++) { L[n] = sat(L[n], 1.6); R[n] = sat(R[n], 1.6); peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n])); }
const fade = S(1.6); for (let n = N - fade; n < N; n++) { const g = (N - n) / fade; L[n] *= g; R[n] *= g; }
const buf = Buffer.alloc(44 + N * 4); const w = (o, s) => buf.write(s, o);
w(0, 'RIFF'); buf.writeUInt32LE(36 + N * 4, 4); w(8, 'WAVE'); w(12, 'fmt '); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); w(36, 'data'); buf.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) { buf.writeInt16LE(Math.round(L[n] / peak * .95 * 32767), 44 + n * 4); buf.writeInt16LE(Math.round(R[n] / peak * .95 * 32767), 46 + n * 4); }
fs.writeFileSync(process.argv[2] || 'phonk.wav', buf); console.log('ok', DUR.toFixed(2), 's');
