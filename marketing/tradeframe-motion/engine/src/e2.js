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
