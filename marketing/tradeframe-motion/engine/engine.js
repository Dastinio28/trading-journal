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
const usd = (v, dec = 0, sign = true) => (v > 0 && sign ? '+' : v < 0 ? '−' : '') + '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const num = (v, dec = 2) => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtTok = s => s.replace(/\{(\w+)\}/g, (m, k) => TOK[k] ?? m);

/* ---------------- seeded demo data (internally consistent, different per video) ---------------- */
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = mulberry(CFG.seed * 9973 + 17);
const ri = (a, z) => a + Math.floor(R() * (z - a + 1));
const r10 = v => Math.round(v / 10) * 10;
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const MONTHS = [['June 2026', 0, 30, 'June', 'Jun'], ['July 2026', 2, 31, 'July', 'Jul'], ['September 2026', 1, 30, 'September', 'Sep']];
const [MONTH, OFF, NDAYS, MNAME, MSHORT] = MONTHS[CFG.seed % 3];
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let DAYS;
for (let tries = 0; tries < 50; tries++) {
  DAYS = [];
  for (let d = 1; d <= NDAYS; d++) { const idx = OFF + d - 1, col = idx % 7; if (col >= 5) { DAYS.push({ d, col, v: 0, n: 0, off: 1 }); continue; }
    const win = R() < .63; DAYS.push({ d, col, v: win ? r10(90 + R() * 650) : -r10(60 + R() * 290), n: ri(1, 3) }); }
  const tot = DAYS.reduce((a, x) => a + x.v, 0); if (tot > 2200 && tot < 6200) break;
}
const TD = DAYS.filter(x => !x.off);
const TOTAL = TD.reduce((a, x) => a + x.v, 0), TRADES = TD.reduce((a, x) => a + x.n, 0);
const BEST = TD.reduce((a, x) => x.v > a.v ? x : a), WORST = TD.reduce((a, x) => x.v < a.v ? x : a);
const WR = ri(57, 67), BE = ri(1, 2), WINS = Math.round(TRADES * WR / 100), LOSSES = TRADES - WINS - BE;
const RUNIT = ri(140, 210), TOTAL_R = TOTAL / RUNIT;
const seq = shuffle([...Array(WINS).fill(1), ...Array(LOSSES).fill(-1), ...Array(BE).fill(0)]);
let rw = seq.map(k => k > 0 ? .6 + R() * 1.7 : k < 0 ? -(.55 + R() * .45) : 0);
{ const lT = -LOSSES * .85, wT = TOTAL_R - lT; const wS = rw.filter(v => v > 0).reduce((a, v) => a + v, 0), lS = rw.filter(v => v < 0).reduce((a, v) => a + v, 0);
  rw = rw.map(v => v > 0 ? v * wT / wS : v < 0 ? v * lT / lS : 0); }
const AVG_WIN = rw.filter(v => v > 0).reduce((a, v) => a + v, 0) / WINS;
const eq = [0]; rw.forEach(v => eq.push(eq[eq.length - 1] + v));
let peak = 0, mdd = 0; eq.forEach(v => { peak = Math.max(peak, v); mdd = Math.min(mdd, v - peak); });
const GW = TD.filter(x => x.v > 0).reduce((a, x) => a + x.v, 0), GL = TD.filter(x => x.v < 0).reduce((a, x) => a + x.v, 0);
const DISC = ri(78, 88);
const APOOL = shuffle(['XAU/USD', 'NQ', 'EUR/USD', 'US30', 'BTC/USD', 'GBP/JPY', 'ES', 'ETH/USD']).slice(0, 5);
const ASSETS = (() => { const neg = -r10(TOTAL * (.04 + R() * .06)), rest = TOTAL - neg, w = [5, 3.4, 2.2, 1.6].map(x => x * (.8 + R() * .4)), ws = w.reduce((a, x) => a + x, 0);
  const vals = w.map(x => r10(rest * x / ws)); vals[0] += rest - vals.reduce((a, x) => a + x, 0); return [...APOOL.slice(0, 4).map((n, i) => [n, vals[i]]), [APOOL[4], neg]]; })();
const ADEF = { 'XAU/USD': [2614.2, 9.9, 'Metals', 2, 'CFD'], 'EUR/USD': [1.0824, .0021, 'FX', 4, 'CFD'], 'NQ': [18245.25, 22.5, 'Index futures', 2, 'Futures'], 'US30': [41250, 60, 'Index CFD', 0, 'CFD'],
  'BTC/USD': [63250, 480, 'Crypto', 0, 'CFD'], 'GBP/JPY': [191.42, .38, 'FX', 2, 'CFD'], 'ES': [5712.5, 6.25, 'Index futures', 2, 'Futures'], 'ETH/USD': [2484, 26, 'Crypto', 2, 'CFD'] };
const FT = (() => { const a = APOOL[0], [p0, d, cat, dec, type] = ADEF[a], entry = p0 * (1 + (R() - .5) * .03), r = Math.round((1.6 + R() * 1.5) * 10) / 10, risk = r10(150 + R() * 100);
  const q = risk / d; return { asset: a, cat, type, dec, entry, stop: entry - d, exit: entry + r * d, r, risk, pnl: r * risk, qty: q >= 100 ? Math.round(q).toLocaleString('en-US') : q >= 10 ? q.toFixed(1) : q.toFixed(2) }; })();
const fp = (v, dec) => num(v, dec);
const DATE = `${String((CFG.seed % 3) === 0 ? 6 : (CFG.seed % 3) === 1 ? 7 : 9).padStart(2, '0')} / ${String(NDAYS).padStart(2, '0')} / 2026`;
const INS = {
  count: { lab: 'Win rate by trade # of the day', bars: [['1st', 68], ['2nd', 65], ['3rd', 61], ['4th', 34], ['5th+', 22]], leak: 3,
    text: [['Your'], ['win'], ['rate'], ['drops'], ['from'], ['65%', 'b'], ['to'], ['31%', 'b'], ['after'], ['your'], ['3rd'], ['trade'], ['of'], ['the'], ['day.'], ['73%', 'g'], ['of'], [MNAME + '’s'], ['losses'], ['came'], ['from'], ['trade'], ['4'], ['or'], ['later.']],
    rule: 'Max 3 trades per day', rs: 'Trades 4 and later cost you <span class="neg">−$' + r10(Math.abs(GL) * .55).toLocaleString('en-US') + '</span> in ' + MNAME + '.' },
  friday: { lab: 'Win rate by weekday', bars: [['Mon', 66], ['Tue', 63], ['Wed', 64], ['Thu', 61], ['Fri', 29]], leak: 4,
    text: [['You'], ['win'], ['64%', 'b'], ['of'], ['trades'], ['Monday'], ['to'], ['Thursday.'], ['On'], ['Friday'], ['afternoons:'], ['29%.', 'b'], ['68%', 'g'], ['of'], [MNAME + '’s'], ['red'], ['days'], ['were'], ['Fridays.']],
    rule: 'No trading Friday after 2 pm', rs: 'Friday afternoons cost you <span class="neg">−$' + r10(Math.abs(GL) * .48).toLocaleString('en-US') + '</span> in ' + MNAME + '.' },
  revenge: { lab: 'Win rate after a loss streak', bars: [['After win', 67], ['1 loss', 58], ['2 losses', 33], ['3+ losses', 19]], leak: 2,
    text: [['After'], ['2'], ['losses'], ['in'], ['a'], ['row,'], ['your'], ['win'], ['rate'], ['falls'], ['to'], ['33%.', 'b'], ['71%', 'g'], ['of'], ['your'], ['drawdown'], ['starts'], ['with'], ['a'], ['revenge'], ['trade.']],
    rule: 'Stop after 2 losses in a row', rs: 'Revenge trades cost you <span class="neg">−$' + r10(Math.abs(GL) * .6).toLocaleString('en-US') + '</span> in ' + MNAME + '.' },
  stops: { lab: 'Win rate by stop handling', bars: [['Kept', 64], ['Moved 1x', 38], ['Moved 2x', 24], ['Removed', 9]], leak: 1,
    text: [['When'], ['you'], ['move'], ['your'], ['stop,'], ['your'], ['win'], ['rate'], ['drops'], ['from'], ['64%', 'b'], ['to'], ['38%.', 'b'], ['Moved'], ['stops'], ['caused'], ['81%', 'g'], ['of'], ['your'], ['biggest'], ['losses.']],
    rule: 'Never move a stop loss', rs: 'Moved stops cost you <span class="neg">−$' + r10(Math.abs(GL) * .5).toLocaleString('en-US') + '</span> in ' + MNAME + '.' },
};
const INSK = CFG.insight || ['count', 'friday', 'revenge', 'stops'][CFG.seed % 4], IN = INS[INSK];
const SETUPS = (() => { const names = shuffle(['Break & retest', 'Liquidity sweep', 'Trend pullback', 'Range fade', 'Opening range break']).slice(0, 4);
  const neg = -r10(TOTAL * (.08 + R() * .06)), rest = TOTAL - neg, w = [4.5, 2.8, 1.6, .9].map(x => x * (.8 + R() * .4)), ws = w.reduce((a, x) => a + x, 0);
  const vals = w.map(x => r10(rest * x / ws)); vals[0] += rest - vals.reduce((a, x) => a + x, 0);
  let left = TRADES; const tr = [.32, .26, .18, .12].map(f => { const n = Math.max(2, Math.round(TRADES * f)); left -= n; return n; });
  const rows = names.map((n, i) => ({ n, v: vals[i], tr: tr[i], wr: [ri(66, 76), ri(58, 66), ri(52, 60), ri(48, 56)][i] }));
  rows.push({ n: 'FOMO entries', v: neg, tr: Math.max(2, left), wr: ri(18, 30) }); return rows; })();
const WEEK = [0, 1, 2, 3, 4].map(c => DAYS.filter(x => x.col === c).reduce((a, x) => a + x.v, 0));
if (INSK === 'friday') { const sh = r10(Math.abs(WEEK[4]) + TOTAL * .12); WEEK[4] -= sh; WEEK[ri(0, 3)] += sh; }
const WWORST = WEEK.indexOf(Math.min(...WEEK));
const RBINS = ['−1', '−0.5', '0', '0.5', '1', '1.5', '2', '2.5', '3+'];
const RDIST = RBINS.map((x, i) => rw.filter(v => Math.min(8, Math.max(0, Math.round(v * 2) + 2)) === i).length);
const CAP = ri(18, 42) * 1000 + ri(0, 9) * 100, RISKAMT = CAP * .01, DLIM = CAP * .03, DUSED = ri(22, 48) / 100;
const IMPN = ri(120, 260);
const JROWS = (() => { const loss = TD.filter(x => x.v < 0), wins = TD.filter(x => x.v > 0); const pickD = shuffle([...loss.slice(0, 4), ...wins.slice(0, 5)]).sort((a, z) => z.d - a.d);
  let f = 0; return pickD.map(x => { const lossy = x.v < 0, fomo = lossy && f < 3 && (f < 2 || R() < .5); if (fomo) f++;
    return { date: `${MSHORT} ${x.d}`, asset: APOOL[ri(0, 4)], long: R() < .62, setup: fomo ? 'FOMO entry' : SETUPS[ri(0, 3)].n, r: x.v / RUNIT / Math.max(1, x.n - 1 || 1), v: lossy ? -r10(Math.abs(x.v) / x.n * 1.2) : r10(x.v / x.n * 1.1), emo: fomo ? 'FOMO' : lossy ? (R() < .5 ? 'Impatient' : 'Tilted') : (R() < .5 ? 'Calm' : 'Confident'), fomo }; }); })();
const TOK = { wr: WR, total: usd(TOTAL), best: usd(BEST.v), worst: usd(WORST.v), n: IMPN, month: MNAME, rule: IN.rule, left: Math.round((1 - DUSED) * 100) + '%' };
const IC = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  brief: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  bars: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
  plus: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  check: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/>',
  up: '<path d="M7 17L17 7M7 7h10v10"/>', down: '<path d="M7 7l10 10M17 7v10H7"/>',
  tick: '<path d="M20 6L9 17l-5-5"/>', lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  spark: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/>',
  dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>',
};
const ico = (k, extra = '') => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${IC[k]}</svg>`;


/* ---------------- build the app window (9 pages) ---------------- */
const NAV = [['Analysis'], ['grid', 'Dashboard', 'dash'], ['brief', 'Portfolio'], ['bars', 'Statistics', 'stats'], ['shield', 'Risk Management', 'risk'], ['cpu', 'AI Analysis', 'ai'],
  ['Journal'], ['plus', 'New Trade', 'add'], ['book', 'Trade Journal', 'journal'], ['cal', 'Calendar', 'cal'], ['clock', 'Weekly Schedule'], ['check', 'Pre-Trade Checklist', 'ck'],
  ['Data'], ['upload', 'Import Trades', 'import']];
const sideHtml = `<div class="side" id="side"><div class="hl" id="hl"></div><div class="brand"><span class="m">T</span>Tradeframe <em class="g">Pro</em></div>${NAV.map(n => n.length === 1 ? `<div class="sec">${n[0]}</div>` : `<div class="nav" ${n[2] ? `data-k="${n[2]}"` : ''}>${ico(n[0])}${n[1]}</div>`).join('')}</div>`;

const KPI = [
  { id: 'kpi-pnl', lab: 'Total P&amp;L', to: TOTAL, f: v => usd(v), cls: 'pos', d: `+${TOTAL_R.toFixed(1)}R · ${MNAME}` },
  { lab: 'Total trades', to: TRADES, f: v => String(Math.round(v)), d: `${ri(1, 3)} still open` },
  { id: 'kpi-wr', lab: 'Win rate', to: WR, f: v => Math.round(v) + '%', d: `${WINS} W · ${LOSSES} L · ${BE} BE` },
  { lab: 'Avg win', to: AVG_WIN, f: v => '+' + v.toFixed(1) + 'R', d: 'per winning trade' },
  { lab: 'Max drawdown', to: mdd, f: v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1) + 'R', cls: 'neg', d: 'peak to trough' },
];
const EW = 640, EH = 250, eMax = Math.max(10, Math.ceil(TOTAL_R / 10) * 10);
const ex = i => 34 + i * (EW - 40) / (eq.length - 1), ey = v => 222 - v / eMax * 200;
const ePath = eq.map((v, i) => (i ? 'L' : 'M') + ex(i).toFixed(1) + ' ' + ey(v).toFixed(1)).join(' ');
const eqSvg = `<svg viewBox="0 0 ${EW} ${EH}" aria-hidden="true"><defs><linearGradient id="eqa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5eead4" stop-opacity=".30"/><stop offset="1" stop-color="#5eead4" stop-opacity="0"/></linearGradient><linearGradient id="eql" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5eead4"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs>
  ${[0, 1, 2, 3].map(i => { const v = eMax / 3 * i, y = ey(v); return `<line x1="34" x2="${EW}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.07)" stroke-dasharray="4 6"/><text x="0" y="${y + 4}" fill="#7f8799" font-family="Roboto Mono, monospace" font-size="11">${Math.round(v)}R</text>`; }).join('')}
  <path id="eqArea" d="${ePath} L${ex(eq.length - 1)} 222 L34 222 Z" fill="url(#eqa)"/><path id="eqLine" d="${ePath}" fill="none" stroke="url(#eql)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle id="eqGlow" r="16" fill="#a78bfa" opacity=".25"/><circle id="eqDot" r="6.5" fill="#fff" stroke="#a78bfa" stroke-width="3"/></svg>`;
const DC = 2 * Math.PI * 70, DSEG = [[WINS / TRADES, '#2dd4a3'], [LOSSES / TRADES, '#fb7185'], [BE / TRADES, '#7f8799']];
const donut = `<svg viewBox="0 0 190 190" aria-hidden="true"><g transform="rotate(-90 95 95)"><circle cx="95" cy="95" r="70" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="22"/>${DSEG.map(d => `<circle class="dseg" cx="95" cy="95" r="70" fill="none" stroke="${d[1]}" stroke-width="22" stroke-dasharray="0 ${DC}"/>`).join('')}</g>
  <text id="dnum" x="95" y="100" text-anchor="middle" fill="#f4f5f7" font-family="Sora, sans-serif" font-weight="800" font-size="34">0%</text><text x="95" y="124" text-anchor="middle" fill="#7f8799" font-family="Roboto Mono, monospace" font-size="11" letter-spacing="1.2">WIN RATE</text></svg>`;
const barsSigned = (rows, H, zero, px, cls, idWorst) => { const mx = Math.max(...rows.map(r => Math.abs(r[1]))); return rows.map(([n, v], i) => { const h = Math.abs(v) / mx * px;
  return `<div class="${cls}" ${idWorst === i ? 'id="st-wworst"' : ''}>${v >= 0 ? `<i class="sbar" style="bottom:${H - zero}px;height:${h}px;background:linear-gradient(180deg,#2dd4a3,rgba(45,212,163,.18));transform-origin:50% 100%"></i><em class="pos" style="bottom:${H - zero + h + 8}px">${usd(v)}</em>`
    : `<i class="sbar" style="top:${zero}px;height:${h}px;background:linear-gradient(0deg,#fb7185,rgba(251,113,133,.2));transform-origin:50% 0"></i><em class="neg" style="top:${zero + h + 8}px">${usd(v)}</em>`}</div>`; }).join(''); };
const pgDash = `<div class="pg" id="pg-dash"><div class="pi"><div class="h1">Dashboard</div><div class="sub">${TRADES} closed positions analyzed · ${MONTH}</div></div>
  <div class="kpis">${KPI.map(k => `<div class="pn kpi pi" ${k.id ? `id="${k.id}"` : ''}><div class="eb">${k.lab}</div><div class="kv ${k.cls || ''}">0</div><div class="kd">${k.d}</div></div>`).join('')}</div>
  <div class="r2"><div class="pn pi" id="pn-equity"><div class="lab">Equity curve (R) — full history</div>${eqSvg}</div>
    <div class="pn pi" id="pn-donut"><div class="lab">Wins / losses / breakeven</div><div class="dn">${donut}<div class="lg"><span><i style="background:#2dd4a3"></i>Wins<b>${WINS}</b></span><span><i style="background:#fb7185"></i>Losses<b>${LOSSES}</b></span><span><i style="background:#7f8799"></i>Breakeven<b>${BE}</b></span></div></div></div></div>
  <div class="r2"><div class="pn pi" id="pn-assets"><div class="lab">P&amp;L by asset</div><div class="ab">${barsSigned(ASSETS, 190, 144, 128, 'abc')}<div class="zl"></div></div><div class="abl">${ASSETS.map(a => `<span>${a[0]}</span>`).join('')}</div></div>
    <div class="pn pi" id="pn-disc"><div class="lab">Discipline score</div><div class="disc"><b id="discv">0%</b><span>rules followed</span></div><div class="track"><i id="disct"></i></div><div class="dnote">Plan followed on ${ri(8, 9)} of your last 10 trades.</div></div></div></div>`;

const fld = (id, label, ph, pre = '', cls = '') => `<div class="f" id="${id}"><label>${label}</label><div class="in ${cls}"><span class="v">${pre}</span><span class="ph">${pre ? '' : ph}</span><i class="caret" hidden></i></div></div>`;
const pgAdd = `<div class="pg" id="pg-add"><div class="pi"><div class="h1">New Position</div><div class="sub">Log the setup, the execution and the result</div></div>
  <div class="pn form pi" id="form"><div class="fsec">Basic information</div>
    <div class="frow">${fld('f-date', 'Entry date', '', DATE)}${fld('f-asset', 'Asset', 'e.g. EUR/USD')}${fld('f-cat', 'Category', 'Select')}${fld('f-type', 'Type', '', FT.type)}</div>
    <div class="fsec">Execution</div><div class="frow"><div class="f"><label>Direction</label><div class="seg"><span id="seg-long">${ico('up')}LONG</span><span>${ico('down')}SHORT</span></div></div>${fld('f-qty', 'Quantity', '0')}${fld('f-entry', 'Entry price', '0.00')}${fld('f-exit', 'Exit price', '0.00')}</div>
    <div class="fsec">Risk &amp; result</div><div class="frow">${fld('f-stop', 'Stop loss', '0.00')}${fld('f-r', 'R multiple', '—', '', 'calc')}${fld('f-pnl', 'P&amp;L', '—', '', 'calc')}<div class="f"><label>Plan followed</label><div class="tgw"><div class="tgl" id="tgl"><i id="tgk"></i></div><span id="tgt">No</span></div></div></div>
    <div class="fsec">Psychology &amp; review</div><div class="frow2"><div class="f"><label>Emotion</label><div class="chips"><span class="chip" id="chip-calm">Calm</span><span class="chip">Confident</span><span class="chip">FOMO</span><span class="chip">Tilted</span></div></div>${fld('f-note', 'Note', 'What did you do well? What would you change?')}</div>
    <div class="fact"><span class="bb">Cancel</span><span class="bb bp" id="btn-save">Save position</span></div></div>
  <div class="toast" id="toast"><span class="tk">${ico('tick')}</span>Position saved<b>+${FT.r.toFixed(1)}R</b></div></div>`;
const NOTES = ['Waited for the retest. No FOMO.', 'Followed the plan. Scaled out at 2R.', 'Patient entry, stop never touched.', 'Clean break, trailed behind structure.'];
const TYPEVAL = { 'f-asset': FT.asset, 'f-cat': FT.cat, 'f-qty': FT.qty, 'f-entry': fp(FT.entry, FT.dec), 'f-exit': fp(FT.exit, FT.dec), 'f-stop': fp(FT.stop, FT.dec), 'f-note': NOTES[CFG.seed % 4],
  'rk-pct': '1', 'rk-entry': fp(FT.entry, FT.dec), 'rk-stop': fp(FT.stop, FT.dec), 'jr-search': 'FOMO' };

const cells = []; let calHtml = '';
{ const wk = [0, 0, 0, 0, 0];
  for (let r = 0; r < 5; r++) { for (let c = 0; c < 7; c++) { const idx = r * 7 + c, day = idx - OFF + 1;
      if (day < 1 || day > NDAYS) { calHtml += '<div class="cell blank"></div>'; cells.push({ r, c }); continue; }
      const D0 = DAYS[day - 1]; if (D0.off) { calHtml += `<div class="cell wk"><span class="d">${day}</span></div>`; cells.push({ r, c }); continue; }
      const v = D0.v, n = D0.n; wk[r] += v; const a = (.12 + .4 * Math.abs(v) / Math.max(BEST.v, -WORST.v)).toFixed(2), col = v > 0 ? '45,212,163' : '251,113,133';
      const best = D0 === BEST, worst = D0 === WORST;
      calHtml += `<div class="cell" ${best ? 'id="cell-best"' : worst ? 'id="cell-worst"' : ''} style="background:rgba(${col},${a});border-color:rgba(${col},${(+a + .15).toFixed(2)})"><span class="d">${day}</span><b>${usd(v)}</b><s>${n} trade${n > 1 ? 's' : ''}</s>${best ? '<i class="bring" id="bring"></i>' : worst ? '<i class="bring neg" id="wring"></i>' : ''}</div>`;
      cells.push({ r, c }); }
    calHtml += `<div class="cell wt"><span class="d">Week ${r + 1}</span><b class="${wk[r] >= 0 ? 'pos' : 'neg'}">${usd(wk[r])}</b><s>&nbsp;</s></div>`; cells.push({ r, c: 7 }); } }
const pgCal = `<div class="pg" id="pg-cal"><div class="pi calhead"><div><div class="h1">Calendar</div><div class="sub">Daily P&amp;L · click a day to open its trades</div></div><div class="month"><span>‹</span>${MONTH}<span>›</span></div><div class="mtot"><span class="eb">Month P&amp;L</span><b class="pos" id="cal-total">+$0</b></div></div>
  <div class="pn pi" id="cal-grid"><div class="dow">${[...DOW, 'Week'].map(d => `<span>${d}</span>`).join('')}</div><div class="cg">${calHtml}</div></div></div>`;

const WMAX = Math.max(...IN.bars.map(x => x[1])) * 1.1;
const pgAi = `<div class="pg" id="pg-ai"><div class="pi"><div class="h1">AI Analysis</div><div class="sub">Monthly review · ${MONTH} · ${TRADES} trades analyzed</div></div>
  <div class="aig" id="ai-wrap"><div class="pn pi" id="ai-insight"><div class="aihd"><span class="av">${ico('spark')}</span><div>Tradeframe AI<small>Pattern found</small></div></div>
      <div class="aitxt">${IN.text.map(([w, c]) => c === 'b' ? `<b class="w">${w}</b>` : c === 'g' ? `<b class="w g">${w}</b>` : `<span class="w">${w}</span>`).join(' ')}</div></div>
    <div class="pn pi" id="ai-chart"><div class="lab">${IN.lab}</div>
      <div class="wr">${IN.bars.map(([l, v], i) => { const bad = i >= IN.leak && (INSK !== 'friday' || i === IN.leak) && (INSK !== 'stops' || i >= 1); return `<div class="bar" ${i === IN.leak ? 'id="wleak"' : ''}><i class="wbar" style="height:${v / WMAX * 100}%;background:${bad ? 'linear-gradient(180deg,rgba(255,255,255,.32),rgba(255,255,255,.08))' : 'linear-gradient(180deg,#5eead4,rgba(94,234,212,.2))'}"></i><em class="wv" style="bottom:calc(${v / WMAX * 100}% + 8px);color:${bad ? '#9199ac' : '#5eead4'}">0%</em></div>`; }).join('')}<div class="avgl" id="avgl" style="bottom:${WR / WMAX * 100}%"><span>avg ${WR}%</span></div></div>
      <div class="wrl">${IN.bars.map(w => `<span>${w[0]}</span>`).join('')}</div></div></div>
  <div class="pn pi" id="ai-rule"><div><div class="lab">Suggested rule</div><div class="rt">${IN.rule}</div><div class="rs">${IN.rs}</div></div><span class="addb" id="btn-rule">${ico('plus')}<span id="btn-rule-t">Add to checklist</span></span></div></div>`;

const CKS = ['Bias defined on the 4H chart', 'Key level marked before entry', 'Risk ≤ 1% of capital', 'Session is valid (London / New York)', 'No high-impact news within 30 min', IN.rule];
const SRC = 2 * Math.PI * 86;
const pgCk = `<div class="pg" id="pg-ck"><div class="pi"><div class="h1">Pre-Trade Checklist</div><div class="sub">Tick every box before you enter a trade</div></div>
  <div class="ckg"><div class="pn pi" id="ck-list">${CKS.map((c, i) => `<div class="ck"><i class="bgf"></i><span class="bx"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path class="tp" d="M20 6L9 17l-5-5"/></svg></span><span>${c}</span>${i === 5 ? '<span class="new">NEW</span>' : ''}</div>`).join('')}</div>
    <div class="pn pi" id="ck-score"><div class="lab">Discipline score</div><div class="sr"><svg viewBox="0 0 200 200"><defs><linearGradient id="srg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5eead4"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><circle cx="100" cy="100" r="86" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="16"/><circle id="srArc" cx="100" cy="100" r="86" fill="none" stroke="url(#srg)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${SRC}" stroke-dashoffset="${SRC}"/></svg><b id="srv">${DISC}%</b></div><span class="ready" id="ready">${ico('tick')}6 / 6 · Ready to trade</span></div></div></div>`;

const GWT = GW, PF = GW / Math.abs(GL), EXP = TOTAL_R / TRADES;
const STK = [['Avg win', usd(GW / WINS)], ['Avg loss', usd(GL / Math.max(1, LOSSES))], ['Profit factor', PF.toFixed(2)], ['Expectancy', (EXP >= 0 ? '+' : '') + EXP.toFixed(2) + 'R'], ['Best streak', ri(4, 8) + ' wins']];
const BESTSET = SETUPS.slice(0, 4).reduce((a, s, i) => s.v > SETUPS[a].v ? i : a, 0);
const pgStats = `<div class="pg" id="pg-stats"><div class="pi"><div class="h1">Advanced Statistics</div><div class="sub">${TRADES} trades · ${MONTH} · all setups</div></div>
  <div class="kpis">${STK.map(([l, v], i) => `<div class="pn kpi pi"><div class="eb">${l}</div><div class="kv ${i === 1 ? 'neg' : i === 0 ? 'pos' : ''}" data-v="${v}">${v}</div></div>`).join('')}</div>
  <div class="stg"><div class="pn pi" id="st-setups"><div class="lab">Performance by setup</div><div class="tbl"><div class="tr th"><span>Setup</span><span>Trades</span><span>Win rate</span><span>P&amp;L</span></div>
      ${SETUPS.map((s, i) => `<div class="tr srow" ${i === BESTSET ? 'id="st-best"' : ''}><i class="hlb"></i><span>${s.n}</span><span>${s.tr}</span><span>${s.wr}%</span><b class="${s.v >= 0 ? 'pos' : 'neg'}">${usd(s.v)}</b></div>`).join('')}</div></div>
    <div class="pn pi" id="st-week"><div class="lab">P&amp;L by weekday</div><div class="wk">${barsSigned(WEEK.map((v, i) => [DOW[i], v]), 190, 140, 120, 'wkc', WWORST)}<div class="zl" style="top:140px"></div></div><div class="abl">${DOW.slice(0, 5).map(d => `<span>${d}</span>`).join('')}</div></div></div>
  <div class="pn pi" id="st-rdist" style="margin-top:14px"><div class="lab">R distribution · every closed trade</div><div class="rd">${RDIST.map((n, i) => `<i class="rbar" style="height:${Math.max(4, n / Math.max(...RDIST) * 100)}%;background:${i < 2 ? 'linear-gradient(180deg,#fb7185,rgba(251,113,133,.2))' : i === 2 ? 'rgba(255,255,255,.2)' : 'linear-gradient(180deg,#5eead4,rgba(94,234,212,.2))'}"></i>`).join('')}</div><div class="rdl">${RBINS.map(x => `<span>${x}R</span>`).join('')}</div></div></div>`;

const GC = 2 * Math.PI * 92;
const pgRisk = `<div class="pg" id="pg-risk"><div class="pi"><div class="h1">Risk Management</div><div class="sub">Size every position from your rules, not your mood</div></div>
  <div class="rkg"><div class="pn pi" id="rk-calc"><div class="lab">Position size calculator</div>
      <div class="rkin">${fld('rk-cap', 'Account balance', '', '$' + num(CAP, 2))}${fld('rk-pct', 'Risk per trade (%)', '0')}${fld('rk-entry', 'Entry price', '0.00')}${fld('rk-stop', 'Stop loss', '0.00')}</div>
      <div class="rkout" id="rk-out"><div class="rko"><span class="eb">Risk amount</span><b id="rk-amt">$0</b></div><div class="rko main" id="rk-size"><span class="eb">Position size</span><b id="rk-sz">0</b></div><div class="rko"><span class="eb">Stop distance</span><b id="rk-dist">0</b></div></div></div>
    <div class="pn pi" id="rk-limits"><div class="lab">Daily loss limit</div><div class="gauge" id="rk-gauge"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="92" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="18"/><circle id="rkArc" cx="110" cy="110" r="92" fill="none" stroke="url(#srg)" stroke-width="18" stroke-linecap="round" stroke-dasharray="${GC}" stroke-dashoffset="${GC}"/></svg><b><span id="rk-gv">0%</span><small>OF ${usd(DLIM, 0, false)} USED</small></b></div>
      <div class="lim"><div>Trades today<b>2 / 3</b></div><div>Open risk<b>0.6%</b></div><div>Max risk per trade<b>1.0%</b></div></div></div></div></div>`;
const RKV = { amt: RISKAMT, size: RISKAMT / (FT.entry - FT.stop), dist: FT.entry - FT.stop };

const pgJournal = `<div class="pg" id="pg-journal"><div class="pi"><div class="h1">Trade Journal</div><div class="sub">${TRADES} trades · ${MONTH}</div></div>
  <div class="jbar pi"><div class="f" id="jr-search"><div class="in"><span class="v"></span><span class="ph">Search trades, setups, emotions…</span><i class="caret" hidden></i></div></div><span class="fch on" id="jr-all">All</span><span class="fch">Wins</span><span class="fch" id="jr-loss">Losses</span><span class="fch">This week</span></div>
  <div class="pn pi" id="jr-table"><div class="jr th"><span>Date</span><span>Asset</span><span>Side</span><span>Setup</span><span>R</span><span>P&amp;L</span><span>Emotion</span></div>
    ${JROWS.map((r, i) => `<div class="jr jrow" ${r.fomo && !JROWS.slice(0, i).some(x => x.fomo) ? 'id="jr-f1"' : ''}><span>${r.date}</span><span>${r.asset}</span><span><i class="sd ${r.long ? 'l' : 's'}">${ico(r.long ? 'up' : 'down')}${r.long ? 'LONG' : 'SHORT'}</i></span><span>${r.setup}</span><b class="${r.v >= 0 ? 'pos' : 'neg'}">${(r.v >= 0 ? '+' : '−') + Math.abs(r.v / RUNIT).toFixed(1)}R</b><b class="${r.v >= 0 ? 'pos' : 'neg'}">${usd(r.v)}</b><span><i class="emo ${r.v < 0 ? 'bad' : ''}">${r.emo}</i></span></div>`).join('')}</div></div>`;

const MAP = [['open_time', 'Entry date'], ['symbol', 'Asset'], ['type', 'Direction'], ['volume', 'Quantity'], ['profit', 'P&amp;L']];
const pgImport = `<div class="pg" id="pg-import"><div class="pi"><div class="h1">Import Trades</div><div class="sub">Bring your full history in from a CSV export</div></div>
  <div class="pi" id="im-drop"><span class="up">${ico('upload')}</span>Drop your CSV here<small>or click to browse · .csv up to 10 MB</small><div class="pbar"><i id="im-pb"></i></div><small id="im-pt">Waiting for a file</small>
    <div class="file" id="im-file"><span class="fi">CSV</span><div><b>my_trades_2026.csv</b><small>${Math.round(IMPN * .9)} KB · ${IMPN} rows</small></div></div></div>
  <div class="img"><div class="pn pi" id="im-map"><div class="lab">Column mapping</div>${MAP.map(([a, z]) => `<div class="mp mrow"><code>${a}</code><span class="ar">→</span><span>${z}</span><span class="ok">${ico('tick')}</span></div>`).join('')}</div>
    <div class="pn pi" id="im-done"><span class="eb">Imported</span><b id="im-count">0</b><span>trades added to your journal<br>stats, calendar and AI updated</span></div></div></div>`;

const CURSOR = `<svg class="cur" id="cur" viewBox="0 0 30 30" aria-hidden="true"><path d="M4 3l20 10.5-8.6 2.3L11 24z" fill="#fff" stroke="#0d0f15" stroke-width="2" stroke-linejoin="round"/></svg><i class="rip" id="rip"></i>`;
const win = $('#win');
win.innerHTML = `<div class="chrome"><i></i><i></i><i></i><div class="url">${ico('lock')}<b>tradeframe.web.app</b><span id="urlh">/#dashboard</span></div></div>
<div class="app">${sideHtml}<div class="main"><div class="top"><div class="capx">CAPITAL&nbsp;&nbsp;$${num(CAP, 2)}</div><div class="tb"><span class="b2">${ico('dl')}Export CSV</span><span class="b2 bp" id="btn-new">+ New Position</span></div></div>
<div class="pages">${pgDash}${pgAdd}${pgCal}${pgAi}${pgCk}${pgStats}${pgRisk}${pgJournal}${pgImport}</div></div></div>${CURSOR}`;

/* ---------------- overlays from the timeline ---------------- */
const SLAMS = TL.slams, SCN = TL.scenes, SUBS = SCN.flatMap(s => s.subs), AN = SCN.flatMap(s => s.ann.map(a => ({ ...a, text: fmtTok(a.text) })));
$('#wmw').innerHTML = 'Tradeframe'.split('').map((ch, i) => `<span class="ch${i >= 5 ? ' g' : ''}">${ch}</span>`).join('');
if (CFG.tagline) $('#tagl').innerHTML = CFG.tagline;
const otl = $$('#ot .ol'); { const [l1, l2] = CFG.outro, w2 = l2.split(' '); otl[0].innerHTML = l1.split(' ').map(w => `<span class="ow">${w}</span>`).join(' ');
  otl[1].innerHTML = w2.map((w, i) => `<span class="ow${i === w2.length - 1 ? ' g' : ''}">${w}</span>`).join(' '); }
const letters = html => { const d = document.createElement('div'); d.innerHTML = html; const out = [];
  const walk = (n, g) => [...n.childNodes].forEach(c => { if (c.nodeType === 3) [...c.textContent].forEach(ch => out.push(`<span class="lt${g ? ' g' : ''}">${ch === ' ' ? '&nbsp;' : ch}</span>`)); else walk(c, g || c.classList.contains('g')); });
  walk(d, false); return out.join(''); };
const plain = h => h.replace(/<[^>]+>/g, '');
$('#slamL').innerHTML = SLAMS.map(s => `<div class="slam th-${s.th}"><div class="sw">${s.small ? `<div class="mask"><div class="ss">${s.small}</div></div>` : ''}<div class="sbw">${s.fx === 'echo' ? [3, 2, 1].map(k => `<span class="sb ghost ${s.num ? 'num' : ''}" style="opacity:${[0, .32, .18, .09][k]}">${letters(s.big)}</span>`).join('') : ''}${s.fx === 'glitch' ? `<span class="sb ghost gA" style="color:${s.th === 'd' ? '#5eead4' : '#0d9488'};mix-blend-mode:${s.th === 'd' ? 'screen' : 'multiply'}">${plain(s.big)}</span><span class="sb ghost gB" style="color:${s.th === 'd' ? '#fb7185' : '#7c3aed'};mix-blend-mode:${s.th === 'd' ? 'screen' : 'multiply'}">${plain(s.big)}</span>` : ''}<span class="sb main ${s.num ? 'num' : ''} ${s.cls || ''}">${s.fx === 'count' ? s.big : letters(s.big)}</span></div><div class="guides"></div></div></div>`).join('');
const slamEls = $$('#slamL .slam').map((el, i) => ({ el, s: SLAMS[i], sb: $('.sb.main', el), lts: $$('.sb.main .lt', el), ghosts: $$('.sb.ghost', el).map(g => ({ g, lts: $$('.lt', g) })), ss: $('.ss', el), sbw: $('.sbw', el), gd: $('.guides', el) }));
const gw = s => fmtTok(s).replace(/<g>/g, '<span class="g">').replace(/<\/g>/g, '</span>');
$('#subs').innerHTML = SUBS.map(([a, z, h]) => { const d = document.createElement('div'); d.innerHTML = gw(h); const ws = [];
  [...d.childNodes].forEach(n => { const g = n.nodeType === 1; n.textContent.split(/\s+/).filter(Boolean).forEach(w => ws.push(`<span class="mw"><span class="wi${g ? ' g' : ''}">${w}</span></span>`)); });
  return `<div class="sub2">${ws.join(' ')}</div>`; }).join('');
const subEls = $$('#subs .sub2').map(el => ({ el, ws: $$('.wi', el) }));
$('#annS').innerHTML = AN.map(a => `<path class="ap" stroke="${a.neg ? '#fb7185' : '#5eead4'}" stroke-width="7" pathLength="1"/><path class="ah" stroke="${a.neg ? '#fb7185' : '#5eead4'}" stroke-width="7"/>`).join('');
$('#annL').innerHTML = AN.map(a => `<div class="alab${a.neg ? ' neg' : ''}">${a.text}</div>`).join('');
const annP = $$('#annS .ap'), annH = $$('#annS .ah'), annLb = $$('#annL .alab');
$('#prog').innerHTML = TL.prog.map(() => '<div class="seg"><i></i></div>').join('');
const progEl = $('#prog'), progF = $$('#prog .seg i');

/* ---------------- element cache ---------------- */
const stage = $('#stage'), vp = $('#viewport'), rig = $('#rig'), mbg = $('#mbg'), punchEl = $('#punch'), orb = $('#orb');
const mark = $('#mark'), markT = $('#markT'), rg = [$('#rg1'), $('#rg2')], wmC = $$('#wm .ch'), tagl = $('#tagl');
const otW = $$('#ot .ow'), ot = $('#ot'), urlp = $('#urlp'), shine = $('#shine'), osub = $('#osub'), oh = $('#oh');
const PGEL = {}; $$('.pg').forEach(el => PGEL[el.id.slice(3)] = { el, items: $$('.pi', el) });
const navEl = {}; $$('.nav[data-k]').forEach(n => navEl[n.dataset.k] = n);
const hl = $('#hl'), urlh = $('#urlh');
const kpiEls = $$('#pg-dash .kv'), eqLine = $('#eqLine'), eqArea = $('#eqArea'), eqDot = $('#eqDot'), eqGlow = $('#eqGlow');
const dsegs = $$('.dseg'), dnum = $('#dnum'), abars = $$('#pg-dash .sbar'), aems = $$('#pg-dash .abc em'), discv = $('#discv'), disct = $('#disct');
const cellEls = $$('#pg-cal .cell'), calTot = $('#cal-total'), bring = $('#bring'), wring = $('#wring');
const aiW = $$('#pg-ai .aitxt .w'), wbars = $$('.wbar'), wvals = $$('.wv'), avgl = $('#avgl'), btnRule = $('#btn-rule'), btnRuleT = $('#btn-rule-t');
const ckRows = $$('#pg-ck .ck'), srArc = $('#srArc'), srv = $('#srv'), ready = $('#ready');
const stK = $$('#pg-stats .kv'), stRows = $$('#pg-stats .srow'), stBest = $('#st-best'), stW = $$('#pg-stats .wkc .sbar'), stWe = $$('#pg-stats .wkc em'), stR = $$('#pg-stats .rbar');
const rkAmt = $('#rk-amt'), rkSz = $('#rk-sz'), rkDist = $('#rk-dist'), rkArc = $('#rkArc'), rkGv = $('#rk-gv');
const jrRows = $$('#pg-journal .jrow'), jrLoss = $('#jr-loss'), jrAll = $('#jr-all');
const imFile = $('#im-file'), imPb = $('#im-pb'), imPt = $('#im-pt'), imMap = $$('#pg-import .mrow'), imCount = $('#im-count');
const cur = $('#cur'), rip = $('#rip'), toast = $('#toast'), segLong = $('#seg-long'), chipCalm = $('#chip-calm');
const tgl = $('#tgl'), tgk = $('#tgk'), tgt = $('#tgt'), btnSave = $('#btn-save');
const fx = $('#fx'), ctx = fx.getContext('2d');
const eqLen = eqLine.getTotalLength(); eqLine.style.strokeDasharray = eqLen;
ckRows.forEach(r => { r._tp = $('.tp', r); r._bg = $('.bgf', r); r._bx = $('.bx', r); r._tp.style.strokeDasharray = 26; });
const TYPE = SCN.flatMap(s => s.type.map(([id, a, z, f]) => { const el = $('#' + id); return { box: $('.in', el), v: $('.v', el), ph: $('.ph', el), ca: $('.caret', el), full: TYPEVAL[id], a, z, f, phText: $('.ph', el).textContent }; }));
const fR = $('#f-r .in'), fRv = $('#f-r .v'), fRph = $('#f-r .ph'), fP = $('#f-pnl .in'), fPv = $('#f-pnl .v'), fPph = $('#f-pnl .ph');
const CLICKS = SCN.flatMap(s => s.clicks), CUR_VIS = SCN.filter(s => s.curVis).map(s => s.curVis), CAMK = TL.cam, BURSTS = TL.bursts;
let CURK = [];

/* ---------------- camera, cursor ---------------- */
function posIn(el) { let x = 0, y = 0, n = el; while (n && n !== win) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return [x + el.offsetWidth / 2, y + el.offsetHeight / 2]; }
function fitEl(el, max) { let fs = parseFloat(getComputedStyle(el).fontSize), g = 0; while (el.offsetWidth > max && g++ < 90) { fs *= .97; el.style.fontSize = fs + 'px'; } return fs; }
function layout() {
  fitEl($('#wmw'), 900); otl.forEach(el => fitEl(el, 940));
  slamEls.forEach(S => {
    S.el.style.visibility = 'inherit';
    const fs = fitEl(S.sb, S.s.num ? 900 : 950); S.ghosts.forEach(G => G.g.style.fontSize = fs + 'px');
    if (S.s.fx === 'snap') {
      const x = S.sbw.offsetLeft + S.sb.offsetLeft, y = S.sbw.offsetTop + S.sb.offsetTop + S.sb.offsetHeight * .08, w = S.sb.offsetWidth, h = S.sb.offsetHeight * .84;
      const Lg = [[0, y, 1080, 3, 'x'], [0, y + h, 1080, 3, 'x'], [x, 0, 3, 1920, 'y'], [x + w, 0, 3, 1920, 'y']];
      const Q = [[x, y], [x + w / 2, y], [x + w, y], [x, y + h / 2], [x + w, y + h / 2], [x, y + h], [x + w / 2, y + h], [x + w, y + h]];
      S.gd.innerHTML = Lg.map(([l, tp, ww, hh, ax]) => `<i class="gd" data-ax="${ax}" style="left:${l}px;top:${tp}px;width:${ww}px;height:${hh}px;transform-origin:${ax === 'x' ? (x + w / 2 - l) + 'px 0' : '0 ' + (y + h / 2) + 'px'}"></i>`).join('') + Q.map(([qx, qy]) => `<i class="gq" style="left:${qx}px;top:${qy}px"></i>`).join('');
      S.gl = $$('.gd', S.gd); S.gq = $$('.gq', S.gd);
    }
    S.el.style.visibility = 'hidden';
  });
  const C = [720, 520];
  CAMK.forEach(k => { k.xy = k.f === 'C' ? C : k.f === 'cursor' ? null : posIn($(k.f)); });
  const at = s => { const [x, y] = posIn($(s)); return [x + 8, y + 6]; };
  CURK = [];
  SCN.forEach(s => { if (!s.clicks.length) return; CURK.push({ b: s.curVis[0] - .25, xy: s.curStart }); s.clicks.forEach(([bc, sel]) => CURK.push({ b: bc - .3, xy: at(sel) }, { b: bc + .2, xy: at(sel) })); });
  CURK.sort((a, z) => a.b - z.b);
}
function curAt(t) {
  const tb = t / BEAT; if (!CURK.length) return [0, 0];
  if (tb <= CURK[0].b) return CURK[0].xy;
  for (let i = 0; i < CURK.length - 1; i++) { const a = CURK[i], z = CURK[i + 1];
    if (tb <= z.b) { if (a.xy[0] === z.xy[0] && a.xy[1] === z.xy[1]) return a.xy;
      const p = RM ? (tb >= z.b ? 1 : 0) : E.io3((tb - a.b) / (z.b - a.b)); const dx = z.xy[0] - a.xy[0], dy = z.xy[1] - a.xy[1], L = Math.hypot(dx, dy) || 1, arc = Math.sin(Math.PI * p) * Math.min(60, L * .18);
      return [a.xy[0] + dx * p - dy / L * arc, a.xy[1] + dy * p + dx / L * arc]; } }
  return CURK[CURK.length - 1].xy;
}
function camAt(t) {
  const tb = t / BEAT, K = CAMK, val = (k, p, d) => k[p] ?? d;
  const res = k => k.f === 'cursor' ? (() => { const c = curAt(Math.max(0, t - .22)); return [clamp(c[0], 520, 1020), clamp(c[1], 300, 760)]; })() : k.xy;
  let a = K[0], z = K[0], p = 0;
  if (tb >= K[K.length - 1].b) { a = z = K[K.length - 1]; }
  else if (tb > K[0].b) for (let i = 0; i < K.length - 1; i++) { if (K[i + 1].b <= K[i].b) continue; if (tb >= K[i].b && tb < K[i + 1].b) { a = K[i]; z = K[i + 1]; p = (tb - a.b) / (z.b - a.b); break; } }
  const e = RM ? (p >= 1 ? 1 : 0) : E[a.e || 'io5'](p), fa = res(a), fz = res(z);
  return { fx: lerp(fa[0], fz[0], e), fy: lerp(fa[1], fz[1], e), s: lerp(a.s, z.s, e), rx: lerp(val(a, 'rx', 0), val(z, 'rx', 0), e), ry: lerp(val(a, 'ry', 0), val(z, 'ry', 0), e), rz: lerp(val(a, 'rz', 0), val(z, 'rz', 0), e), ty: lerp(val(a, 'ty', 0), val(z, 'ty', 0), e) };
}
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function clickBump(t, bc) { const d = t - b(bc); return d > -.06 && d < .16 ? Math.sin(clamp((d + .06) / .22) * Math.PI) : 0; }
/* ---------------- particles ---------------- */
function drawFx(t) {
  ctx.clearRect(0, 0, 1080, 1920);
  if (RM) return;
  for (const B of BURSTS) {
    const dt = t - b(B.b); if (dt < 0 || dt > B.life || !B.xy) continue;
    let s2 = B.sd * 7919; const r = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < B.n; i++) {
      const a = r() * Math.PI * 2, v = B.sp * (.3 + .7 * r()), sz = 4 + r() * 10, kind = r(), spin = (r() - .5) * 14, life = B.life * (.6 + .4 * r());
      if (dt > life) continue;
      const d = v * (1 - Math.exp(-3.4 * dt)) / 3.4, x = B.xy[0] + Math.cos(a) * d, y = B.xy[1] + Math.sin(a) * d + 480 * dt * dt;
      ctx.globalAlpha = 1 - (dt / life) ** 2;
      ctx.fillStyle = kind < .45 ? '#5eead4' : kind < .85 ? '#a78bfa' : '#ffffff';
      ctx.save(); ctx.translate(x, y); ctx.rotate(spin * dt);
      if (kind < .6) ctx.fillRect(-sz / 2, -sz / 4, sz, sz / 2); else { ctx.beginPath(); ctx.arc(0, 0, sz / 2.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
}

/* ---------------- slam cards ---------------- */
function renderSlams(t) {
  const tb = t / BEAT; let light = false, any = false;
  slamEls.forEach(S => {
    const s = S.s, on = tb >= s.b && tb < s.e; show(S.el, on); if (!on) return;
    any = true; light = s.th === 'l';
    const p = t - b(s.b), dur = b(s.e) - b(s.b);
    const amp = RM ? 0 : (['shake', 'glitch', 'snap'].includes(s.fx) ? 18 : 8) * Math.exp(-p * 13);
    S.sbw.style.transform = `translate(${(Math.sin(p * 95) * amp).toFixed(1)}px,${(Math.cos(p * 80) * amp * .6).toFixed(1)}px)`;
    if (S.ss) put(S.ss, anim(t, { at: b(s.b), dur: .3, y: 46 }));
    const lt = S.lts;
    if (s.fx === 'stretch') {
      const q = M(E.spring(P(p, 0, .55)));
      S.sb.style.transform = `scale(${(2.1 - 1.1 * q).toFixed(4)},${(.45 + .55 * q).toFixed(4)})`; S.sb.style.opacity = clamp(p / .06);
    } else if (s.fx === 'shake') {
      const q = M(E.expo(P(p, 0, .28)));
      S.sb.style.transform = `scale(${(1.35 - .35 * q).toFixed(4)}) rotate(${(RM ? 0 : Math.sin(p * 55) * 7 * Math.exp(-p * 7)).toFixed(2)}deg)`; S.sb.style.opacity = clamp(p / .05);
    } else if (s.fx === 'snap') {
      lt.forEach((el, i) => put(el, anim(t, { at: b(s.b) + i * .028, dur: .3, ease: E.expo, s: 1.45, blur: 10 })));
      (S.gl || []).forEach((g, i) => { const q = M(E.o5(P(p, .04 + i * .03, .26))); g.style.transform = g.dataset.ax === 'x' ? `scaleX(${q.toFixed(4)})` : `scaleY(${q.toFixed(4)})`; });
      (S.gq || []).forEach((g, i) => put(g, { op: clamp((p - .2 - i * .015) / .08), s: .6 + .4 * M(E.back(P(p, .2 + i * .015, .25))) }));
    } else if (s.fx === 'echo') {
      const f = (el, i, pp) => { const q = P(pp, i * .04, .55); put(el, { op: clamp(q * 4), y: (1 - M(E.spring(q))) * -520 }); };
      lt.forEach((el, i) => f(el, i, p));
      S.ghosts.forEach((G, k) => G.lts.forEach((el, i) => f(el, i, p - (3 - k) * .035)));
    } else if (s.fx === 'glitch') {
      const fr = Math.floor(t * 24), dec = Math.exp(-p * 3.5);
      S.sb.style.transform = `skewX(${RM ? 0 : ((hash(fr) - .5) * 18 * dec).toFixed(2)}deg) scale(${(1.25 - .25 * M(E.expo(P(p, 0, .3)))).toFixed(4)})`; S.sb.style.opacity = clamp(p / .05);
      lt.forEach((el, i) => el.style.transform = `translateY(${RM ? 0 : ((hash(fr * 7 + i) - .5) * 70 * dec).toFixed(1)}px)`);
      S.ghosts.forEach((G, k) => { const o = RM ? 0 : (k ? -1 : 1) * (8 + 34 * dec * hash(fr * 3 + k)); G.g.style.transform = `translate(${o.toFixed(1)}px,${((hash(fr + k * 9) - .5) * 20 * dec).toFixed(1)}px)`; G.g.style.opacity = RM ? 0 : (.25 + .6 * dec).toFixed(3); });
    } else if (s.fx === 'pop') {
      const q = M(E.spring(P(p, 0, .4)));
      S.sb.style.transform = `scale(${(1.7 - .7 * q).toFixed(4)})`; S.sb.style.opacity = clamp(p / .05);
    } else if (s.fx === 'count') {
      const v = Math.round(30 * E.o3(P(p, .05, dur - .12)));
      txt(S.sb, '00:' + String(v).padStart(2, '0'));
      S.sb.style.transform = `scale(${(1 + .06 * Math.exp(-((p * 30) % 1) * 4) * (v < 30 ? 1 : 0)).toFixed(4)})`;
    }
  });
  progEl.classList.toggle('onlight', light);
  return any;
}

/* ---------------- annotations ---------------- */
function rectOf(el) { const sr = stage.getBoundingClientRect(), kk = sr.width / 1080, r = el.getBoundingClientRect(); return { x: (r.left - sr.left) / kk, y: (r.top - sr.top) / kk, w: r.width / kk, h: r.height / kk }; }
function renderAnn(t) {
  const tb = t / BEAT;
  AN.forEach((a, i) => {
    const on = tb >= a.b && tb < a.e, P1 = annP[i], H = annH[i], Lb = annLb[i];
    if (!on) { P1.style.opacity = 0; H.style.opacity = 0; show(Lb, false); return; }
    const r = rectOf($(a.sel)), cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const p = M(E.o3(P(t, b(a.b), .38))), fade = 1 - clamp((t - b(a.e) + .1) / .1);
    let d, lx, ly, head = '';
    show(Lb, true); const lw = Lb.offsetWidth;
    if (a.kind === 'circle') {
      const rx = r.w / 2 + 26, ry = r.h / 2 + 22, n = 40; let pts = [];
      for (let k = 0; k <= n; k++) { const th = -Math.PI * .6 + k / n * Math.PI * 2.15, wob = 1 + (hash(i * 50 + k) - .5) * .06 + k / n * .05; pts.push([cx + Math.cos(th) * rx * wob, cy + Math.sin(th) * ry * wob]); }
      d = 'M' + pts.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L');
      lx = cx - lw / 2; ly = a.dy < 0 ? cy - ry - 78 : cy + ry + 18;
    } else {
      lx = cx + a.dx - lw / 2; ly = cy + a.dy - 30;
      const sx = clamp(lx, 50, 1030 - lw) + lw / 2, sy = ly + (a.dy < 0 ? 78 : -14);
      const ang = Math.atan2(cy - sy, cx - sx), ex = cx - Math.cos(ang) * 34, ey = cy - Math.sin(ang) * 34;
      const mx = (sx + ex) / 2 - Math.sin(ang) * 60, my = (sy + ey) / 2 + Math.cos(ang) * 60;
      d = `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      const ta = Math.atan2(ey - my, ex - mx), hl2 = 30;
      head = `M${(ex - Math.cos(ta - .5) * hl2).toFixed(1)} ${(ey - Math.sin(ta - .5) * hl2).toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)} L${(ex - Math.cos(ta + .5) * hl2).toFixed(1)} ${(ey - Math.sin(ta + .5) * hl2).toFixed(1)}`;
    }
    lx = clamp(lx, 50, 1030 - lw); ly = clamp(ly, 640, 1760);
    P1.setAttribute('d', d); P1.style.strokeDasharray = `${p.toFixed(3)} 2`; P1.style.opacity = fade;
    H.setAttribute('d', head); H.style.opacity = (head && p > .9 ? fade : 0);
    const q = M(E.o3(P(t, b(a.b) + .12, .35)));
    Lb.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px) rotate(-4deg)`; Lb.style.opacity = fade;
    Lb.style.clipPath = `inset(-20% ${((1 - q) * 100).toFixed(1)}% -20% -5%)`;
  });
}

/* ---------------- render(t) ---------------- */
const D0 = TL.D, O = TL.O, ORB = TL.orb;
function render(t) {
  const drop = t >= b(D0) ? Math.exp(-(t - b(D0)) * 3) : 0;
  $('#amba').style.transform = `translate(${RM ? 0 : Math.sin(t * .35) * 130}px,${RM ? 0 : Math.cos(t * .27) * 90}px) scale(${1 + .25 * drop})`;
  $('#ambb').style.transform = `translate(${RM ? 0 : Math.cos(t * .3) * 140}px,${RM ? 0 : Math.sin(t * .23) * 110}px) scale(${1 + .25 * drop})`;
  $('#dots').style.transform = `translate(${RM ? 0 : (-t * 12) % 40}px,${RM ? 0 : (-t * 7) % 40}px) scale(${(RM ? 1 : 1 + .12 * drop).toFixed(4)})`;
  renderSlams(t);
  const introOn = t >= b(ORB[0] - .1) && t < b(D0 + .05); show($('#intro'), introOn);
  if (introOn) put(orb, { op: clamp((t - b(ORB[0] - .1)) / .08), s: .3 + 1.1 * M(E.i3(P(t, b(ORB[0] - .1), b(.6)))) });
  const logoOn = t >= b(D0 - .1) && t < b(D0 + 5.02); show($('#logo'), logoOn);
  if (logoOn) {
    const mo = anim(t, { at: b(D0), dur: .75, ease: E.spring, s: 1.9, r: -24 }); mo.op = t >= b(D0) ? 1 : 0; mo.s *= 1 + .06 * pulse(t, D0 + 1, D0 + 3);
    const z = E.i3(P(t, b(D0 + 4), BEAT)); if (t >= b(D0 + 4)) mo.s *= 1 + 15 * M(z);
    put(mark, mo); markT.style.opacity = (1 - clamp(z * 2.5)).toFixed(3);
    rg.forEach((el, i) => { const p = P(t, b(D0) + i * .12, .9); put(el, { op: RM || p <= 0 || p >= 1 ? 0 : (1 - p) * .9, s: 1 + 5.5 * E.o3(p) }); });
    wmC.forEach((el, i) => put(el, anim(t, { at: b(D0 + .75) + i * .03, dur: .5, ease: E.o5, y: 180, outAt: b(D0 + 3.5) + i * .015, outDur: .25, oy: -50 })));
    put(tagl, anim(t, { at: b(D0 + 1.75), dur: .5, y: 40, blur: 10, outAt: b(D0 + 3.6), outDur: .25 }));
  }
  let fl = 0; TL.flash.forEach(([fb, a]) => { if (t >= b(fb)) fl = Math.max(fl, a * (1 - P(t, b(fb), .22))); });
  $('#flash').style.opacity = RM ? 0 : fl.toFixed(3);

  const appOn = t >= b(D0 + 5) && t < b(O + 1.3); show(punchEl, appOn);
  const appOp = clamp((t - b(SCN[0].v)) / .25) * (1 - E.o3(P(t, b(O + .2), b(1))));
  if (appOn) {
    const c = camAt(t), tx = -(c.fx - 720) * c.s, ty = -(c.fy - 500) * c.s + c.ty;
    win.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg) rotateZ(${c.rz.toFixed(2)}deg) scale(${c.s.toFixed(4)})`;
    win.style.opacity = appOp.toFixed(3);
    let pu = 0; TL.punch.forEach(pb => { if (t >= b(pb) && t < b(pb) + .5) pu = Math.max(pu, Math.exp(-(t - b(pb)) * 11)); });
    punchEl.style.transformOrigin = '540px 1150px'; punchEl.style.transform = `scale(${(1 + (RM ? 0 : .06) * pu).toFixed(4)})`;
    let bl = 0;
    if (!RM) { SCN.forEach(s => { if (s.zoomBlur) { const zp = P(t, b(s.zoomBlur[0]), b(s.zoomBlur[1]) - b(s.zoomBlur[0])); if (t < b(s.zoomBlur[1])) bl = Math.max(bl, 22 * zp * zp); } });
      const pa = P(t, b(O + .2), b(1)); if (pa > 0 && pa < 1) bl = Math.max(bl, 26 * pa * pa); }
    if (bl > .3) { mbg.setAttribute('stdDeviation', `${(bl * .6).toFixed(1)} ${bl.toFixed(1)}`); rig.style.filter = 'url(#mb)'; } else rig.style.filter = 'none';
    renderApp(t);
  }
  const ovOn = appOn && t >= b(SCN[0].v); show($('#ovl'), ovOn);
  if (ovOn) {
    $('#scrt').style.opacity = $('#scrb').style.opacity = $('#foot').style.opacity = appOp.toFixed(3);
    const tb = t / BEAT;
    SUBS.forEach(([a, z], i) => { const S = subEls[i], on = tb >= a && tb < z; show(S.el, on); if (!on) return; S.ws.forEach((w, j) => put(w, anim(t, { at: b(a) + j * .045, dur: .36, ease: E.o5, y: 110 }))); });
    renderAnn(t);
  }
  const progOn = t >= b(SCN[0].s) && t < b(O + 1.3); show(progEl, progOn);
  if (progOn) { progEl.style.opacity = (1 - P(t, b(O + .4), .3)).toFixed(3); TL.prog.forEach(([a, z], i) => progF[i].style.transform = `scaleX(${P(t, b(a), b(z) - b(a)).toFixed(4)})`); }
  const outOn = t >= b(O + .8); show($('#outro'), outOn);
  if (outOn) {
    [1, 1.5, 2, 2.5].forEach((w, i) => { if (otW[i]) put(otW[i], anim(t, { at: b(O + w), dur: .34, ease: E.expo, s: 1.4, blur: 18 })); });
    for (let i = 4; i < otW.length; i++) put(otW[i], anim(t, { at: b(O + 2.5), dur: .34, ease: E.expo, s: 1.4, blur: 18 }));
    const up = M(E.io5(P(t, b(O + 3.5), .6))), ps = 1 + .035 * pulse(t, O + 1, O + 3);
    ot.style.transform = `translateY(${(-170 * up).toFixed(1)}px) scale(${((1 - .08 * up) * ps).toFixed(4)})`;
    put(urlp, anim(t, { at: b(O + 4), dur: .7, ease: E.spring, s: .82, y: 50 }));
    shine.style.transform = `translateX(${(-260 + 1300 * E.io3(P(t, b(O + 4.5), 1.1))).toFixed(1)}px) skewX(-12deg)`;
    put(osub, anim(t, { at: b(O + 5), dur: .5, y: 30, blur: 8 })); put(oh, anim(t, { at: b(O + 5.5), dur: .5, y: 20, blur: 6 }));
  }
  drawFx(t);
}

const RENDER = {
  add(t, s) { const T = s.t;
    const on = t >= b(T.long); segLong.classList.toggle('on', on); segLong.style.transform = `scale(${on ? (.9 + .1 * M(E.spring(P(t, b(T.long), .5)))).toFixed(4) : 1})`;
    const rp = P(t, b(T.r), .6), re = M(E.o3(rp));
    if (rp > 0) { txt(fRv, '+' + (FT.r * re).toFixed(1) + 'R'); txt(fRph, ''); txt(fPv, usd(FT.pnl * re, 2)); txt(fPph, ''); } else { txt(fRv, ''); txt(fRph, '—'); txt(fPv, ''); txt(fPph, '—'); }
    [fR, fP].forEach(el => { el.classList.toggle('done', rp >= 1); el.style.transform = `scale(${rp > 0 ? (.9 + .1 * M(E.spring(rp))).toFixed(4) : 1})`; });
    const cc = t >= b(T.calm); chipCalm.classList.toggle('on', cc); chipCalm.style.transform = `scale(${cc ? (.88 + .12 * M(E.spring(P(t, b(T.calm), .5)))).toFixed(4) : 1})`;
    const tp = M(E.spring(P(t, b(T.tgl), .5))); tgl.classList.toggle('on', t >= b(T.tgl)); tgk.style.transform = `translateX(${(22 * tp).toFixed(1)}px)`; txt(tgt, t >= b(T.tgl) ? 'Yes' : 'No');
    btnSave.style.transform = `scale(${(1 - .08 * clickBump(t, T.save)).toFixed(4)})`;
    put(toast, anim(t, { at: b(T.toast), dur: .5, ease: E.spring, y: -40, s: .9 })); },
  dash(t, s) { const T = s.t;
    KPI.forEach((k, i) => { const p = E.expo(P(t, b(T.kpi + i * .5), .95)); txt(kpiEls[i], k.f(k.to * (RM ? (p > 0 ? 1 : 0) : p))); });
    const ep = M(E.io3(P(t, b(T.eq), b(1.5)))); eqLine.style.strokeDashoffset = (eqLen * (1 - ep)).toFixed(1); eqArea.style.opacity = E.o3(P(t, b(T.eq + 1.1), .5)).toFixed(3);
    const pt = eqLine.getPointAtLength(eqLen * Math.max(ep, .001)); [eqDot, eqGlow].forEach(c => { c.setAttribute('cx', pt.x.toFixed(1)); c.setAttribute('cy', pt.y.toFixed(1)); c.style.opacity = ep > 0 ? 1 : 0; });
    eqGlow.setAttribute('r', (16 + 8 * pulse(t, T.eq - 1, T.eq + 4)).toFixed(1));
    const dp = M(E.o5(P(t, b(T.donut), 1.1))) * DC; let acc = 0;
    dsegs.forEach((sg, i) => { const len = DSEG[i][0] * DC, vis = clamp(dp - acc, 0, len); sg.setAttribute('stroke-dasharray', `${vis.toFixed(2)} ${DC}`); sg.setAttribute('stroke-dashoffset', (-acc).toFixed(2)); acc += len; });
    txt(dnum, Math.round(WR * M(E.o5(P(t, b(T.donut), 1.1)))) + '%');
    abars.forEach((el, i) => { const p = P(t, b(T.bars) + i * .07, .6); el.style.transform = `scaleY(${M(E.spring(p)).toFixed(4)})`; aems[i].style.opacity = clamp((p - .4) * 3).toFixed(3); });
    const dd = M(E.o5(P(t, b(T.disc), 1))); txt(discv, Math.round(DISC * dd) + '%'); disct.style.transform = `scaleX(${(DISC / 100 * dd).toFixed(4)})`; },
  cal(t, s) { const T = s.t;
    cellEls.forEach((el, i) => { const { r, c } = cells[i]; const p = P(t, b(T.wave) + (r + c) * .04, .5); put(el, { op: E.o3(p), y: (1 - M(E.o5(p))) * 30, s: .84 + .16 * M(E.back(p)) }); });
    txt(calTot, usd(TOTAL * M(E.expo(P(t, b(T.total), 1.2)))));
    put(bring, anim(t, { at: b(T.best), dur: .55, ease: E.spring, s: 1.3 })); put(wring, anim(t, { at: b(T.worst), dur: .55, ease: E.spring, s: 1.3 })); },
  ai(t, s) { const T = s.t;
    aiW.forEach((el, i) => put(el, anim(t, { at: b(T.words) + i * .05, dur: .3, ease: E.o3, y: 10, blur: 6 })));
    wbars.forEach((el, i) => { const p = P(t, b(T.bars) + i * .08, .6); el.style.transform = `scaleY(${M(E.spring(p)).toFixed(4)})`; wvals[i].style.opacity = clamp((p - .3) * 3).toFixed(3); txt(wvals[i], Math.round(IN.bars[i][1] * M(E.o3(p))) + '%'); });
    avgl.style.opacity = E.o3(P(t, b(T.avg), .4)).toFixed(3);
    const done = t >= b(T.add); btnRule.classList.toggle('done', done); txt(btnRuleT, done ? 'Added to checklist' : 'Add to checklist');
    btnRule.style.transform = `scale(${done ? (.9 + .1 * M(E.spring(P(t, b(T.add), .5)))).toFixed(4) : (1 - .06 * clickBump(t, T.add)).toFixed(4)})`; },
  ck(t, s) { const T = s.t;
    ckRows.forEach((row, i) => { const tk = T.tick0 + i * .5, p = P(t, b(tk), .22), on = p > 0; row.classList.toggle('on', on); row._tp.style.strokeDashoffset = (26 * (1 - M(E.o3(p)))).toFixed(2);
      row._bg.style.opacity = on ? (1 - .6 * P(t, b(tk) + .15, .5)).toFixed(3) : 0; row._bx.style.transform = `scale(${on ? (.75 + .25 * M(E.spring(P(t, b(tk), .45)))).toFixed(4) : 1})`; });
    const v = DISC + 7 * M(E.o3(P(t, b(T.score), .8))); srArc.style.strokeDashoffset = (SRC * (1 - v / 100)).toFixed(2); txt(srv, Math.round(v) + '%');
    srv.style.transform = `scale(${(1 + .12 * Math.exp(-Math.max(0, t - b(T.score + .9)) * 8) * (t >= b(T.score + .9) ? 1 : 0)).toFixed(4)})`;
    put(ready, anim(t, { at: b(T.ready), dur: .55, ease: E.spring, s: .85, y: 12 })); },
  stats(t, s) { const T = s.t;
    stK.forEach((el, i) => put(el, anim(t, { at: b(T.kpi + i * .5), dur: .45, ease: E.spring, s: .8, y: 14 })));
    stRows.forEach((el, i) => put(el, anim(t, { at: b(T.rows) + i * .09, dur: .45, x: -40, blur: 6 })));
    $('.hlb', stBest).style.opacity = E.o3(P(t, b(T.best), .3)).toFixed(3); stBest.style.transform = `scale(${(1 + .03 * Math.exp(-Math.max(0, t - b(T.best)) * 6) * (t >= b(T.best) ? 1 : 0)).toFixed(4)})`;
    stW.forEach((el, i) => { const p = P(t, b(T.week) + i * .08, .6); el.style.transform = `scaleY(${M(E.spring(p)).toFixed(4)})`; stWe[i].style.opacity = clamp((p - .4) * 3).toFixed(3); });
    stR.forEach((el, i) => { el.style.transform = `scaleY(${M(E.spring(P(t, b(T.rdist) + i * .05, .6))).toFixed(4)})`; }); },
  risk(t, s) { const T = s.t, p = M(E.expo(P(t, b(T.out), .9)));
    txt(rkAmt, usd(RKV.amt * p, 2, false)); txt(rkSz, (RKV.size * p).toLocaleString('en-US', { maximumFractionDigits: RKV.size < 10 ? 2 : RKV.size < 1000 ? 1 : 0 }));
    txt(rkDist, num(RKV.dist * p, FT.dec)); [$('#rk-size')].forEach(el => el.style.transform = `scale(${t >= b(T.out) ? (.92 + .08 * M(E.spring(P(t, b(T.out), .5)))).toFixed(4) : 1})`);
    const g = DUSED * M(E.o5(P(t, b(T.gauge), 1))); rkArc.style.strokeDashoffset = (GC * (1 - g)).toFixed(2); txt(rkGv, Math.round(g * 100) + '%'); },
  journal(t, s) { const T = s.t, lossOn = t >= b(T.loss), sp = P(t, b(T.search), .3);
    jrLoss.classList.toggle('on', lossOn); jrAll.classList.toggle('on', !lossOn);
    jrRows.forEach((el, i) => { const r = JROWS[i], st = anim(t, { at: b(T.rows) + i * .07, dur: .45, y: 22, blur: 6 });
      let dim = 1; if (lossOn && r.v >= 0) dim = 1 - .85 * E.o3(P(t, b(T.loss), .3)); if (r.v < 0 && !r.fomo) dim = 1 - .7 * E.o3(sp);
      st.op *= dim; put(el, st); }); },
  import(t, s) { const T = s.t, fp2 = P(t, b(T.file), .7), fe = M(E.o5(fp2));
    put(imFile, { op: clamp(fp2 * 3) * (1 - P(t, b(T.prog) + .2, .25)), x: (1 - fe) * 420, y: (1 - fe) * -360, r: (1 - fe) * 14, s: 1 - .1 * P(t, b(T.prog), .2) });
    const pp = P(t, b(T.prog), b(T.progEnd) - b(T.prog)); imPb.style.transform = `scaleX(${pp.toFixed(4)})`;
    txt(imPt, pp <= 0 ? 'Waiting for a file' : pp < 1 ? `Parsing ${Math.round(IMPN * pp)} / ${IMPN} rows` : 'Done · 0 errors');
    imMap.forEach((el, i) => put(el, anim(t, { at: b(T.map) + i * .1, dur: .4, x: -30, blur: 4 })));
    txt(imCount, String(Math.round(IMPN * M(E.expo(P(t, b(T.done), 1)))))); },
};
function renderApp(t) {
  let ci = 0; SCN.forEach((s, i) => { if (t >= b(s.s)) ci = i; });
  const sc = SCN[ci], prev = SCN[Math.max(0, ci - 1)];
  Object.entries(PGEL).forEach(([k, P0]) => show(P0.el, k === sc.page));
  PGEL[sc.page].items.forEach((el, j) => put(el, anim(t, { at: b(sc.v) + .05 + j * .05, dur: .45, y: 26, blur: 8 })));
  const np = ci === 0 ? 1 : M(E.back(P(t, b(sc.v) - .1, .42)));
  hl.style.transform = `translateY(${lerp(navEl[prev.page].offsetTop, navEl[sc.page].offsetTop, np).toFixed(1)}px)`;
  Object.entries(navEl).forEach(([k, el]) => el.classList.toggle('on', k === (np > .5 ? sc.page : prev.page)));
  txt(urlh, '/#' + sc.hash);
  TYPE.forEach(f => { const n = Math.round(P(t, b(f.a), b(f.z) - b(f.a)) * f.full.length); txt(f.v, f.full.slice(0, n)); txt(f.ph, n ? '' : f.phText);
    const foc = t >= b(f.f) && t < b(f.z) + .3; f.box.classList.toggle('focus', foc); f.ca.hidden = !foc; });
  RENDER[sc.page](t, sc);
  let cv = 0; CUR_VIS.forEach(([a, z]) => { cv = Math.max(cv, clamp((t - b(a)) / .15) * (1 - clamp((t - b(z)) / .12))); });
  if (cv > 0) { const [x, y] = curAt(t); let bump = 0, rc = null;
    CLICKS.forEach(([bc]) => { bump = Math.max(bump, clickBump(t, bc)); if (t >= b(bc) && t < b(bc) + .5) rc = bc; });
    put(cur, { op: cv, x, y, s: 1 - .2 * bump });
    if (rc != null && !RM) { const p = P(t, b(rc), .5), [rx, ry] = curAt(b(rc)); put(rip, { op: (1 - p) * .9, x: rx + 4, y: ry + 3, s: .3 + 1.1 * E.o3(p) }); } else rip.style.opacity = 0;
  } else { cur.style.opacity = 0; rip.style.opacity = 0; }
}
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
