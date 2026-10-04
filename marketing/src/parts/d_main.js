/* ---------------- timeline content ---------------- */
const SLAMS = [
  { b: 0, e: 1, th: 'd', big: 'YOU', fx: 'stretch' },
  { b: 1, e: 2, th: 'l', big: 'LOSE', fx: 'shake' },
  { b: 2, e: 3, th: 'd', big: 'MONEY.', fx: 'snap', cls: 'negc' },
  { b: 3, e: 4, th: 'l', small: 'and you', big: 'DON’T', fx: 'echo' },
  { b: 4, e: 5, th: 'd', big: 'KNOW', fx: 'stretch' },
  { b: 5, e: 6, th: 'l', big: '<span class="g">WHY.</span>', fx: 'glitch' },
  { b: 6, e: 6.5, th: 'd', big: '3', fx: 'pop', num: 1 },
  { b: 6.5, e: 7, th: 'l', big: '2', fx: 'pop', num: 1 },
  { b: 7, e: 7.5, th: 'd', big: '<span class="g">1</span>', fx: 'pop', num: 1 },
  { b: 13, e: 14.5, th: 'l', small: '01 / 05', big: 'LOG IT.', fx: 'snap' },
  { b: 14.5, e: 15.5, th: 'd', small: 'in under', big: '00:30', fx: 'count' },
  { b: 26, e: 27.5, th: 'd', small: '02 / 05 · see your', big: '<span class="g">EDGE.</span>', fx: 'stretch' },
  { b: 35.5, e: 36.5, th: 'l', small: '03 / 05 · spot your', big: 'BEST DAYS', fx: 'echo' },
  { b: 43, e: 44.5, th: 'd', small: '04 / 05 · know', big: '<span class="g">WHY?</span>', fx: 'glitch' },
  { b: 51, e: 52, th: 'l', small: '05 / 05', big: 'FIX IT.', fx: 'snap' },
];
const SUBS = [
  [16, 18, 'Pick your <g>asset.</g>'], [18, 19.5, '<g>Long</g> or short?'], [19.5, 22, 'Entry. Exit. <g>Stop.</g>'],
  [22, 23.5, 'R and P&amp;L: <g>automatic.</g>'], [23.5, 24.75, 'How did you <g>feel?</g>'], [24.75, 26, '<g>Saved.</g> 20 seconds.'],
  [27.5, 29, 'Every number <g>that matters.</g>'], [29, 30.5, 'Your <g>real</g> P&amp;L.'], [30.5, 31.5, 'Your <g>real</g> win rate.'],
  [31.5, 33, 'Your equity, <g>live.</g>'], [33, 35.5, 'Your <g>discipline.</g>'],
  [36.5, 38.4, 'Every day, <g>colored.</g>'], [38.4, 40, 'Green? <g>Repeat it.</g>'], [40, 43, 'Red? <g>Find out why.</g>'],
  [44.5, 47.25, 'AI reads <g>every trade.</g>'], [47.25, 49, 'And finds <g>the leak.</g>'], [49, 51, 'One click <g>to fix it.</g>'],
  [52, 55, 'Before every trade: <g>tick.</g>'], [55, 57.4, 'Discipline <g>goes up.</g>'],
];
const AN = [
  { b: 17.7, e: 19.3, sel: '#f-cat .in', text: 'auto-filled', kind: 'arrow', dx: 120, dy: -230 },
  { b: 22.2, e: 23.9, sel: '#f-r .in', text: 'done for you', kind: 'circle', dy: -1 },
  { b: 29.15, e: 30.45, sel: '#kpi-pnl', text: 'this month', kind: 'circle', dy: 1 },
  { b: 30.6, e: 31.45, sel: '#kpi-wr', text: '2 of 3 trades win', kind: 'arrow', dx: -160, dy: 260 },
  { b: 32.2, e: 32.95, sel: '#eqDot', text: 'new high', kind: 'arrow', dx: -260, dy: -180 },
  { b: 33.2, e: 34.7, sel: '#discv', text: 'rules followed', kind: 'circle', dy: 1 },
  { b: 38.6, e: 39.95, sel: '#cell-best', text: 'repeat this', kind: 'circle', dy: -1 },
  { b: 40.15, e: 42.2, sel: '#cell-worst', text: 'why?', kind: 'circle', dy: -1, neg: 1 },
  { b: 47.6, e: 48.95, sel: '#wb3', text: 'the leak', kind: 'arrow', dx: -300, dy: -200, neg: 1 },
  { b: 49.1, e: 50.9, sel: '#btn-rule', text: '1 click', kind: 'arrow', dx: -240, dy: 230 },
  { b: 55.3, e: 57.2, sel: '#srv', text: '+7 points', kind: 'circle', dy: 1 },
];
const FEAT = [[13, 26], [26, 35.5], [35.5, 43], [43, 51], [51, 57.5]];
const PUNCH = [16.75, 18.75, 19.75, 20.5, 21.25, 22, 23.75, 25, 29, 30.5, 31.5, 33, 38.4, 40, 47.25, 49.75, 52.5, 53.5, 54.5, 55];
const FLASH = [[8, .4], [13, .3], [26, .22], [35.5, .3], [43, .22], [51, .3], [29, .1], [30.5, .1], [31.5, .1], [33, .1], [40, .12], [47.25, .1], [55, .12]];

/* ---------------- build overlays ---------------- */
$('#wmw').innerHTML = 'Tradeframe'.split('').map((ch, i) => `<span class="ch${i >= 5 ? ' g' : ''}">${ch}</span>`).join('');
const letters = html => { const d = document.createElement('div'); d.innerHTML = html; const out = [];
  const walk = (n, wrapG) => [...n.childNodes].forEach(c => { if (c.nodeType === 3) [...c.textContent].forEach(ch => out.push(`<span class="lt${wrapG ? ' g' : ''}">${ch === ' ' ? '&nbsp;' : ch}</span>`)); else walk(c, wrapG || c.classList.contains('g')); });
  walk(d, false); return out.join(''); };
$('#slamL').innerHTML = SLAMS.map(s => `<div class="slam th-${s.th}"><div class="sw">${s.small ? `<div class="mask"><div class="ss">${s.small}</div></div>` : ''}<div class="sbw">${s.fx === 'echo' ? [3, 2, 1].map(k => `<span class="sb ghost ${s.num ? 'num' : ''}" style="opacity:${[0, .32, .18, .09][k]}">${letters(s.big)}</span>`).join('') : ''}${s.fx === 'glitch' ? `<span class="sb ghost gA" style="color:${s.th === 'd' ? '#5eead4' : '#0d9488'};mix-blend-mode:${s.th === 'd' ? 'screen' : 'multiply'}">${s.big.replace(/<[^>]+>/g, '')}</span><span class="sb ghost gB" style="color:${s.th === 'd' ? '#fb7185' : '#7c3aed'};mix-blend-mode:${s.th === 'd' ? 'screen' : 'multiply'}">${s.big.replace(/<[^>]+>/g, '')}</span>` : ''}<span class="sb main ${s.num ? 'num' : ''} ${s.cls || ''}">${s.fx === 'count' ? s.big : letters(s.big)}</span></div><div class="guides"></div></div></div>`).join('');
const slamEls = $$('#slamL .slam').map((el, i) => ({ el, s: SLAMS[i], sb: $('.sb.main', el), lts: $$('.sb.main .lt', el), ghosts: $$('.sb.ghost', el).map(g => ({ g, lts: $$('.lt', g) })), ss: $('.ss', el), sbw: $('.sbw', el), gd: $('.guides', el) }));
const gw = s => s.replace(/<g>/g, '<span class="g">').replace(/<\/g>/g, '</span>');
$('#subs').innerHTML = SUBS.map(([a, z, h]) => { const d = document.createElement('div'); d.innerHTML = gw(h); const ws = [];
  [...d.childNodes].forEach(n => { const g = n.nodeType === 1; (n.textContent).split(/\s+/).filter(Boolean).forEach(w => ws.push(`<span class="mw"><span class="wi${g ? ' g' : ''}">${w}</span></span>`)); });
  return `<div class="sub2">${ws.join(' ')}</div>`; }).join('');
const subEls = $$('#subs .sub2').map(el => ({ el, ws: $$('.wi', el) }));
$('#annS').innerHTML = AN.map(a => `<path class="ap" stroke="${a.neg ? '#fb7185' : '#5eead4'}" stroke-width="7" pathLength="1"/><path class="ah" stroke="${a.neg ? '#fb7185' : '#5eead4'}" stroke-width="7"/>`).join('');
$('#annL').innerHTML = AN.map(a => `<div class="alab${a.neg ? ' neg' : ''}">${a.text}</div>`).join('');
const annP = $$('#annS .ap'), annH = $$('#annS .ah'), annLb = $$('#annL .alab');
$('#prog').innerHTML = FEAT.map(() => '<div class="seg"><i></i></div>').join('');
const progEl = $('#prog'), progF = $$('#prog .seg i');

/* ---------------- element cache ---------------- */
const stage = $('#stage'), vp = $('#viewport'), rig = $('#rig'), mbg = $('#mbg'), punchEl = $('#punch'), orb = $('#orb');
const mark = $('#mark'), markT = $('#markT'), rg = [$('#rg1'), $('#rg2')], wmC = $$('#wm .ch'), tagl = $('#tagl');
const otW = $$('#ot .ow'), ot = $('#ot'), urlp = $('#urlp'), shine = $('#shine'), osub = $('#osub'), oh = $('#oh');
const PG = [['add', 13, 26, 15.5, 'add'], ['dash', 26, 35.5, 27.5, 'dashboard'], ['cal', 35.5, 43, 36.5, 'calendar'], ['ai', 43, 51, 44.5, 'ai'], ['ck', 51, 99, 52, 'checklist']]
  .map(([k, s, e, v, h]) => ({ k, s, e, v, h, el: $('#pg-' + k), items: $$('#pg-' + k + ' .pi') }));
const navEl = {}; $$('.nav[data-k]').forEach(n => navEl[n.dataset.k] = n);
const hl = $('#hl'), urlh = $('#urlh');
const kpiEls = $$('#pg-dash .kv'), eqLine = $('#eqLine'), eqArea = $('#eqArea'), eqDot = $('#eqDot'), eqGlow = $('#eqGlow');
const dsegs = $$('.dseg'), dnum = $('#dnum'), abars = $$('.abar'), aems = $$('.abc em'), discv = $('#discv'), disct = $('#disct');
const cellEls = $$('#pg-cal .cell'), calTot = $('#cal-total'), bring = $('#bring'), wring = $('#wring');
const aiW = $$('#pg-ai .aitxt .w'), wbars = $$('.wbar'), wvals = $$('.wv'), avgl = $('#avgl'), btnRule = $('#btn-rule'), btnRuleT = $('#btn-rule-t');
const ckRows = $$('#pg-ck .ck'), srArc = $('#srArc'), srv = $('#srv'), ready = $('#ready');
const cur = $('#cur'), rip = $('#rip'), toast = $('#toast'), segLong = $('#seg-long'), chipCalm = $('#chip-calm');
const tgl = $('#tgl'), tgk = $('#tgk'), tgt = $('#tgt'), btnSave = $('#btn-save');
const fx = $('#fx'), ctx = fx.getContext('2d');
const eqLen = eqLine.getTotalLength(); eqLine.style.strokeDasharray = eqLen;
ckRows.forEach(r => { const p = $('.tp', r); r._tp = p; r._bg = $('.bgf', r); r._bx = $('.bx', r); p.style.strokeDasharray = 26; });

const TYPE = [['#f-asset', 'XAU/USD', 16.85, 17.5, 16.75], ['#f-cat', 'Metals', 17.7, 17.9, 17.7], ['#f-qty', '20', 19.0, 19.3, 19.0],
  ['#f-entry', '2,614.20', 19.85, 20.35, 19.75], ['#f-exit', '2,637.90', 20.6, 21.05, 20.5], ['#f-stop', '2,604.30', 21.35, 21.8, 21.25],
  ['#f-note', 'Waited for the retest. No FOMO.', 24.1, 24.7, 24.0]].map(([s, full, a, z, f]) => {
  const el = $(s); return { box: $('.in', el), v: $('.v', el), ph: $('.ph', el), ca: $('.caret', el), full, a, z, f, phText: $('.ph', el).textContent };
});
const fR = $('#f-r .in'), fRv = $('#f-r .v'), fRph = $('#f-r .ph'), fP = $('#f-pnl .in'), fPv = $('#f-pnl .v'), fPph = $('#f-pnl .ph');

/* ---------------- camera, cursor ---------------- */
function posIn(el) { let x = 0, y = 0, n = el; while (n && n !== win) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return [x + el.offsetWidth / 2, y + el.offsetHeight / 2]; }
const CAMK = [
  { b: 15.5, f: '#form', s: .5, rx: 55, ry: -20, rz: 6, e: 'expo' },
  { b: 16.5, f: 'cursor', s: 1.3, rx: 5, ry: -4, e: 'lin' },
  { b: 25.25, f: 'cursor', s: 1.34, rx: 4, ry: -2, e: 'io5' },
  { b: 26, f: 'C', s: .8, rx: 10, ry: 8, e: 'lin' },
  { b: 27.5, f: 'C', s: .6, rx: 24, ry: -16, rz: 4, e: 'expo' },
  { b: 29, f: 'C', s: .74, rx: 12, ry: -8, e: 'lin' },
  { b: 29, f: '#kpi-pnl', s: 1.55, rx: 4, ry: -3, e: 'lin' },
  { b: 30.5, f: '#kpi-pnl', s: 1.68, rx: 3, ry: -1, e: 'lin' },
  { b: 30.5, f: '#kpi-wr', s: 1.55, rx: 4, ry: 3, e: 'lin' },
  { b: 31.5, f: '#kpi-wr', s: 1.64, rx: 3, ry: 2, e: 'lin' },
  { b: 31.5, f: '#pn-equity', s: 1.12, rx: 8, ry: -6, e: 'lin' },
  { b: 33, f: '#pn-equity', s: 1.24, rx: 6, ry: 4, e: 'lin' },
  { b: 33, f: '#pn-disc', s: 1.38, rx: 6, ry: 4, e: 'lin' },
  { b: 34.75, f: '#pn-disc', s: 1.46, rx: 5, ry: 3, e: 'lin' },
  { b: 35.5, f: '#pn-disc', s: 1.46, e: 'lin' },
  { b: 35.5, f: '#cal-grid', s: .7, rx: 28, ry: -8, rz: -3, e: 'lin' },
  { b: 36.5, f: '#cal-grid', s: .7, rx: 28, ry: -8, rz: -3, e: 'expo' },
  { b: 38.3, f: '#cal-grid', s: .82, rx: 16, ry: 4, e: 'lin' },
  { b: 38.4, f: '#cell-best', s: 1.5, rx: 6, ry: 0, e: 'lin' },
  { b: 40, f: '#cell-best', s: 1.62, rx: 5, e: 'lin' },
  { b: 40, f: '#cell-worst', s: 1.5, rx: 6, ry: -4, e: 'lin' },
  { b: 42.2, f: '#cell-worst', s: 1.7, rx: 5, ry: -3, e: 'i3' },
  { b: 43, f: '#cell-worst', s: 3.6, e: 'lin' },
  { b: 43, f: 'C', s: .6, rx: 20, ry: 12, e: 'lin' },
  { b: 44.5, f: 'C', s: .6, rx: 20, ry: 12, e: 'expo' },
  { b: 45.5, f: '#ai-insight', s: 1.3, rx: 5, ry: -4, e: 'lin' },
  { b: 47.25, f: '#ai-insight', s: 1.36, rx: 4, ry: -3, e: 'lin' },
  { b: 47.25, f: '#ai-chart', s: 1.3, rx: 5, ry: 4, e: 'lin' },
  { b: 48.9, f: '#ai-chart', s: 1.38, rx: 4, ry: 3, e: 'io5' },
  { b: 49.5, f: '#ai-rule', s: 1.0, rx: 4, ry: 2, e: 'lin' },
  { b: 51, f: '#ai-rule', s: 1.04, e: 'lin' },
  { b: 51, f: '#ck-list', s: .75, rx: 18, ry: -10, e: 'lin' },
  { b: 52, f: '#ck-list', s: .75, rx: 18, ry: -10, e: 'expo' },
  { b: 53, f: '#ck-list', s: 1.08, rx: 6, ry: -4, e: 'lin' },
  { b: 55, f: '#ck-list', s: 1.14, rx: 5, ry: -3, e: 'lin' },
  { b: 55, f: '#ck-score', s: 1.35, rx: 4, ry: 4, e: 'lin' },
  { b: 56.6, f: '#ck-score', s: 1.46, rx: 3, ry: 3, e: 'i3' },
  { b: 57.5, f: 'C', s: .3, rx: 40, ry: 0, rz: -10, ty: -260, e: 'lin' },
];
const CLICKS = [[16.75, '#f-asset .in'], [18.75, '#seg-long'], [19.75, '#f-entry .in'], [20.5, '#f-exit .in'], [21.25, '#f-stop .in'], [23.75, '#chip-calm'], [25, '#btn-save'], [49.75, '#btn-rule']];
const CUR_VIS = [[15.75, 26], [48.5, 51]];
let CURK = [];
const BURSTS = [{ b: 8, x: 540, y: 760, n: 96, sp: 1750, life: 1.35, sd: 3 }, { b: 25, sel: '#btn-save', n: 50, sp: 950, life: .95, sd: 9 }, { b: 62, sel: '#urlp', n: 44, sp: 900, life: 1.05, sd: 5 }];

function fitEl(el, max) { let fs = parseFloat(getComputedStyle(el).fontSize), g = 0; while (el.offsetWidth > max && g++ < 80) { fs *= .97; el.style.fontSize = fs + 'px'; } return fs; }
function layout() {
  fitEl($('#wmw'), 900); $$('#ot .ol').forEach(el => fitEl(el, 940));
  slamEls.forEach(S => {
    S.el.style.visibility = 'inherit';
    const fs = fitEl(S.sb, S.s.num ? 900 : 950);
    S.ghosts.forEach(G => G.g.style.fontSize = fs + 'px');
    if (S.s.fx === 'snap') {
      const x = S.sbw.offsetLeft + S.sb.offsetLeft, y = S.sbw.offsetTop + S.sb.offsetTop + S.sb.offsetHeight * .08, w = S.sb.offsetWidth, h = S.sb.offsetHeight * .84;
      const L = [[0, y, 1080, 3, 'x'], [0, y + h, 1080, 3, 'x'], [x, 0, 3, 1920, 'y'], [x + w, 0, 3, 1920, 'y']];
      const Q = [[x, y], [x + w / 2, y], [x + w, y], [x, y + h / 2], [x + w, y + h / 2], [x, y + h], [x + w / 2, y + h], [x + w, y + h]];
      S.gd.innerHTML = L.map(([l, tp, ww, hh, ax]) => `<i class="gd" data-ax="${ax}" style="left:${l}px;top:${tp}px;width:${ww}px;height:${hh}px;transform-origin:${ax === 'x' ? (x + w / 2 - l) + 'px 0' : '0 ' + (y + h / 2) + 'px'}"></i>`).join('') + Q.map(([qx, qy]) => `<i class="gq" style="left:${qx}px;top:${qy}px"></i>`).join('');
      S.gl = $$('.gd', S.gd); S.gq = $$('.gq', S.gd);
    }
    S.el.style.visibility = 'hidden';
  });
  const C = [720, 520];
  CAMK.forEach(k => { k.xy = k.f === 'C' ? C : k.f === 'cursor' ? null : posIn($(k.f)); });
  const at = s => { const [x, y] = posIn($(s)); return [x + 8, y + 6]; };
  CURK = [{ b: 15.5, xy: [1120, 300] }];
  CLICKS.forEach(([bc, s]) => { if (bc === 49.75) CURK.push({ b: 48.5, xy: [1240, 330] }); CURK.push({ b: bc - .3, xy: at(s) }, { b: bc + .2, xy: at(s) }); });
  CURK.sort((a, z) => a.b - z.b);
}
function curAt(t) {
  const tb = t / BEAT;
  if (!CURK.length) return [0, 0];
  if (tb <= CURK[0].b) return CURK[0].xy;
  for (let i = 0; i < CURK.length - 1; i++) {
    const a = CURK[i], z = CURK[i + 1];
    if (tb <= z.b) {
      if (a.xy[0] === z.xy[0] && a.xy[1] === z.xy[1]) return a.xy;
      const p = RM ? (tb >= z.b ? 1 : 0) : E.io3((tb - a.b) / (z.b - a.b));
      const dx = z.xy[0] - a.xy[0], dy = z.xy[1] - a.xy[1], L = Math.hypot(dx, dy) || 1, arc = Math.sin(Math.PI * p) * Math.min(60, L * .18);
      return [a.xy[0] + dx * p - dy / L * arc, a.xy[1] + dy * p + dx / L * arc];
    }
  }
  return CURK[CURK.length - 1].xy;
}
function camAt(t) {
  const tb = t / BEAT, K = CAMK;
  const val = (k, prop, d) => k[prop] ?? d;
  const res = k => k.f === 'cursor' ? (() => { const c = curAt(Math.max(0, t - .22)); return [clamp(c[0], 520, 1020), clamp(c[1], 300, 760)]; })() : k.xy;
  let a = K[0], z = K[0], p = 0;
  if (tb >= K[K.length - 1].b) { a = z = K[K.length - 1]; }
  else if (tb > K[0].b) for (let i = 0; i < K.length - 1; i++) { if (K[i + 1].b <= K[i].b) continue; if (tb >= K[i].b && tb < K[i + 1].b) { a = K[i]; z = K[i + 1]; p = (tb - a.b) / (z.b - a.b); break; } }
  const e = RM ? (p >= 1 ? 1 : 0) : E[a.e || 'io5'](p);
  const fa = res(a), fz = res(z);
  return { fx: lerp(fa[0], fz[0], e), fy: lerp(fa[1], fz[1], e), s: lerp(a.s, z.s, e), rx: lerp(val(a, 'rx', 0), val(z, 'rx', 0), e), ry: lerp(val(a, 'ry', 0), val(z, 'ry', 0), e), rz: lerp(val(a, 'rz', 0), val(z, 'rz', 0), e), ty: lerp(val(a, 'ty', 0), val(z, 'ty', 0), e) };
}
function whipX(t) { if (RM) return 0; if (t >= b(34.75) && t < b(35.5)) return -1500 * E.i3(P(t, b(34.75), b(35.5) - b(34.75))); return 0; }
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

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
function render(t) {
  const drop = t >= b(8) ? Math.exp(-(t - b(8)) * 3) : 0;
  $('#amba').style.transform = `translate(${RM ? 0 : Math.sin(t * .35) * 130}px,${RM ? 0 : Math.cos(t * .27) * 90}px) scale(${1 + .25 * drop})`;
  $('#ambb').style.transform = `translate(${RM ? 0 : Math.cos(t * .3) * 140}px,${RM ? 0 : Math.sin(t * .23) * 110}px) scale(${1 + .25 * drop})`;
  $('#dots').style.transform = `translate(${RM ? 0 : (-t * 12) % 40}px,${RM ? 0 : (-t * 7) % 40}px) scale(${(RM ? 1 : 1 + .12 * drop).toFixed(4)})`;

  const slamOn = renderSlams(t);

  /* orb anticipation */
  const introOn = t >= b(7.4) && t < b(8.05); show($('#intro'), introOn);
  if (introOn) put(orb, { op: clamp((t - b(7.4)) / .08), s: .3 + 1.1 * M(E.i3(P(t, b(7.4), b(.6)))) });

  /* logo */
  const logoOn = t >= b(7.9) && t < b(13.02); show($('#logo'), logoOn);
  if (logoOn) {
    const mo = anim(t, { at: b(8), dur: .75, ease: E.spring, s: 1.9, r: -24 });
    mo.op = t >= b(8) ? 1 : 0; mo.s *= 1 + .06 * pulse(t, 9, 11);
    const z = E.i3(P(t, b(12), BEAT)); if (t >= b(12)) mo.s *= 1 + 15 * M(z);
    put(mark, mo); markT.style.opacity = (1 - clamp(z * 2.5)).toFixed(3);
    rg.forEach((el, i) => { const p = P(t, b(8) + i * .12, .9); put(el, { op: RM || p <= 0 || p >= 1 ? 0 : (1 - p) * .9, s: 1 + 5.5 * E.o3(p) }); });
    wmC.forEach((el, i) => put(el, anim(t, { at: b(8.75) + i * .03, dur: .5, ease: E.o5, y: 180, outAt: b(11.5) + i * .015, outDur: .25, oy: -50 })));
    put(tagl, anim(t, { at: b(9.75), dur: .5, y: 40, blur: 10, outAt: b(11.6), outDur: .25 }));
  }
  let fl = 0; FLASH.forEach(([fb, a]) => { if (t >= b(fb)) fl = Math.max(fl, a * (1 - P(t, b(fb), .22))); });
  $('#flash').style.opacity = RM ? 0 : fl.toFixed(3);

  /* app */
  const appOn = t >= b(13) && t < b(57.6); show(punchEl, appOn);
  const appOp = clamp((t - b(15.5)) / .25) * (1 - E.o3(P(t, b(56.6), b(57.5) - b(56.6))));
  if (appOn) {
    const c = camAt(t), w = whipX(t);
    const tx = -(c.fx - 720) * c.s + w, ty = -(c.fy - 500) * c.s + c.ty;
    win.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg) rotateZ(${c.rz.toFixed(2)}deg) scale(${c.s.toFixed(4)})`;
    win.style.opacity = appOp.toFixed(3);
    let pu = 0; PUNCH.forEach(pb => { if (t >= b(pb) && t < b(pb) + .5) pu = Math.max(pu, Math.exp(-(t - b(pb)) * 11)); });
    punchEl.style.transformOrigin = '540px 1150px';
    punchEl.style.transform = `scale(${(1 + (RM ? 0 : .06) * pu).toFixed(4)})`;
    let bx = 0, by = 0;
    if (!RM) {
      const v = (whipX(t + 1 / 240) - whipX(t - 1 / 240)) * 120; bx = Math.min(80, Math.abs(v) / 55);
      const zp = P(t, b(42.25), b(43) - b(42.25)); if (t < b(43)) { bx = Math.max(bx, 22 * zp * zp); by = Math.max(by, 22 * zp * zp); }
      const pa = P(t, b(56), b(57.5) - b(56)); if (pa > 0 && pa < 1) by = Math.max(by, 26 * pa * pa);
    }
    if (bx > .3 || by > .3) { mbg.setAttribute('stdDeviation', `${bx.toFixed(1)} ${by.toFixed(1)}`); rig.style.filter = 'url(#mb)'; } else rig.style.filter = 'none';
    renderApp(t);
  }

  /* overlay: subtitles, annotations, progress */
  const ovOn = appOn && t >= b(15.5); show($('#ovl'), ovOn);
  if (ovOn) {
    $('#scrt').style.opacity = $('#scrb').style.opacity = $('#foot').style.opacity = appOp.toFixed(3);
    const tb = t / BEAT;
    SUBS.forEach(([a, z], i) => { const S = subEls[i], on = tb >= a && tb < z; show(S.el, on); if (!on) return;
      S.ws.forEach((w, j) => put(w, anim(t, { at: b(a) + j * .045, dur: .36, ease: E.o5, y: 110 }))); });
    renderAnn(t);
  }
  const progOn = t >= b(13) && t < b(57.6); show(progEl, progOn);
  if (progOn) { progEl.style.opacity = (1 - P(t, b(56.8), .3)).toFixed(3);
    FEAT.forEach(([a, z], i) => progF[i].style.transform = `scaleX(${P(t, b(a), b(z) - b(a)).toFixed(4)})`); }

  /* outro */
  const outOn = t >= b(57.4); show($('#outro'), outOn);
  if (outOn) {
    const wt = [58, 58.5, 59.5, 60];
    otW.forEach((el, i) => put(el, anim(t, { at: b(wt[i]), dur: .34, ease: E.expo, s: 1.4, blur: 18 })));
    const up = M(E.io5(P(t, b(61.5), .6)));
    const ps = 1 + .035 * pulse(t, 58, 61);
    ot.style.transform = `translateY(${(-170 * up).toFixed(1)}px) scale(${((1 - .08 * up) * ps).toFixed(4)})`;
    put(urlp, anim(t, { at: b(62), dur: .7, ease: E.spring, s: .82, y: 50 }));
    shine.style.transform = `translateX(${(-260 + 1300 * E.io3(P(t, b(62.5), 1.1))).toFixed(1)}px) skewX(-12deg)`;
    put(osub, anim(t, { at: b(63.5), dur: .5, y: 30, blur: 8 }));
    put(oh, anim(t, { at: b(64.5), dur: .5, y: 20, blur: 6 }));
  }
  drawFx(t);
}

function renderApp(t) {
  let ci = 0; PG.forEach((pg, i) => { if (t >= b(pg.s)) ci = i; });
  PG.forEach((pg, i) => {
    show(pg.el, i === ci); if (i !== ci) return;
    pg.items.forEach((el, j) => put(el, anim(t, { at: b(pg.v) + .05 + j * .05, dur: .45, y: 26, blur: 8 })));
  });
  const pg = PG[ci], prev = PG[Math.max(0, ci - 1)];
  const np = ci === 0 ? 1 : M(E.back(P(t, b(pg.v) - .1, .42)));
  hl.style.transform = `translateY(${lerp(navEl[prev.k].offsetTop, navEl[pg.k].offsetTop, np).toFixed(1)}px)`;
  Object.entries(navEl).forEach(([k, el]) => el.classList.toggle('on', k === (np > .5 ? pg.k : prev.k)));
  txt(urlh, '/#' + pg.h);

  if (pg.k === 'add') {
    TYPE.forEach(f => {
      const n = Math.round(P(t, b(f.a), b(f.z) - b(f.a)) * f.full.length);
      txt(f.v, f.full.slice(0, n)); txt(f.ph, n ? '' : f.phText);
      const foc = t >= b(f.f) && t < b(f.z) + .3; f.box.classList.toggle('focus', foc); f.ca.hidden = !foc;
    });
    const on = t >= b(18.75); segLong.classList.toggle('on', on);
    segLong.style.transform = `scale(${on ? (.9 + .1 * M(E.spring(P(t, b(18.75), .5)))).toFixed(4) : 1})`;
    const rp = P(t, b(22), .6), re = M(E.o3(rp));
    if (rp > 0) { txt(fRv, '+' + (2.4 * re).toFixed(1) + 'R'); txt(fRph, ''); txt(fPv, usd(474 * re, 2)); txt(fPph, ''); }
    else { txt(fRv, ''); txt(fRph, '—'); txt(fPv, ''); txt(fPph, '—'); }
    [fR, fP].forEach(el => { el.classList.toggle('done', rp >= 1); el.style.transform = `scale(${rp > 0 ? (.9 + .1 * M(E.spring(rp))).toFixed(4) : 1})`; });
    const cc = t >= b(23.75); chipCalm.classList.toggle('on', cc);
    chipCalm.style.transform = `scale(${cc ? (.88 + .12 * M(E.spring(P(t, b(23.75), .5)))).toFixed(4) : 1})`;
    const tp = M(E.spring(P(t, b(24), .5)));
    tgl.classList.toggle('on', t >= b(24)); tgk.style.transform = `translateX(${(22 * tp).toFixed(1)}px)`; txt(tgt, t >= b(24) ? 'Yes' : 'No');
    btnSave.style.transform = `scale(${(1 - .08 * clickBump(t, 25)).toFixed(4)})`;
    put(toast, anim(t, { at: b(25.2), dur: .5, ease: E.spring, y: -40, s: .9 }));
  }
  if (pg.k === 'dash') {
    KPI.forEach((k, i) => { const p = E.expo(P(t, b(27.75 + i * .5), .95)); txt(kpiEls[i], k.f(k.to * (RM ? (p > 0 ? 1 : 0) : p))); });
    const ep = M(E.io3(P(t, b(31.5), b(1.5))));
    eqLine.style.strokeDashoffset = (eqLen * (1 - ep)).toFixed(1);
    eqArea.style.opacity = E.o3(P(t, b(32.6), .5)).toFixed(3);
    const pt = eqLine.getPointAtLength(eqLen * Math.max(ep, .001));
    [eqDot, eqGlow].forEach(c => { c.setAttribute('cx', pt.x.toFixed(1)); c.setAttribute('cy', pt.y.toFixed(1)); c.style.opacity = ep > 0 ? 1 : 0; });
    eqGlow.setAttribute('r', (16 + 8 * pulse(t, 31, 35)).toFixed(1));
    const dp = M(E.o5(P(t, b(28.5), 1.1))) * DC; let acc = 0;
    dsegs.forEach((s, i) => { const len = DSEG[i][0] * DC, vis = clamp(dp - acc, 0, len); s.setAttribute('stroke-dasharray', `${vis.toFixed(2)} ${DC}`); s.setAttribute('stroke-dashoffset', (-acc).toFixed(2)); acc += len; });
    txt(dnum, Math.round(64 * M(E.o5(P(t, b(28.5), 1.1)))) + '%');
    abars.forEach((el, i) => { const p = P(t, b(28) + i * .07, .6); el.style.transform = `scaleY(${M(E.spring(p)).toFixed(4)})`; aems[i].style.opacity = clamp((p - .4) * 3).toFixed(3); });
    const dd = M(E.o5(P(t, b(33), 1)));
    txt(discv, Math.round(84 * dd) + '%'); disct.style.transform = `scaleX(${(.84 * dd).toFixed(4)})`;
  }
  if (pg.k === 'cal') {
    cellEls.forEach((el, i) => { const { r, c } = cells[i]; const p = P(t, b(36.6) + (r + c) * .04, .5);
      put(el, { op: E.o3(p), y: (1 - M(E.o5(p))) * 30, s: .84 + .16 * M(E.back(p)) }); });
    txt(calTot, usd(TOTAL * M(E.expo(P(t, b(36.8), 1.2)))));
    put(bring, anim(t, { at: b(38.5), dur: .55, ease: E.spring, s: 1.3 }));
    put(wring, anim(t, { at: b(40.1), dur: .55, ease: E.spring, s: 1.3 }));
  }
  if (pg.k === 'ai') {
    aiW.forEach((el, i) => put(el, anim(t, { at: b(44.8) + i * .05, dur: .3, ease: E.o3, y: 10, blur: 6 })));
    wbars.forEach((el, i) => { const p = P(t, b(47.3) + i * .08, .6); el.style.transform = `scaleY(${M(E.spring(p)).toFixed(4)})`;
      wvals[i].style.opacity = clamp((p - .3) * 3).toFixed(3); txt(wvals[i], Math.round(WRATE[i][1] * M(E.o3(p))) + '%'); });
    avgl.style.opacity = E.o3(P(t, b(48), .4)).toFixed(3);
    const done = t >= b(49.75); btnRule.classList.toggle('done', done); txt(btnRuleT, done ? 'Added to checklist' : 'Add to checklist');
    btnRule.style.transform = `scale(${done ? (.9 + .1 * M(E.spring(P(t, b(49.75), .5)))).toFixed(4) : (1 - .06 * clickBump(t, 49.75)).toFixed(4)})`;
  }
  if (pg.k === 'ck') {
    ckRows.forEach((row, i) => { const tk = 52.5 + i * .5, p = P(t, b(tk), .22), on = p > 0; row.classList.toggle('on', on);
      row._tp.style.strokeDashoffset = (26 * (1 - M(E.o3(p)))).toFixed(2);
      row._bg.style.opacity = on ? (1 - .6 * P(t, b(tk) + .15, .5)).toFixed(3) : 0;
      row._bx.style.transform = `scale(${on ? (.75 + .25 * M(E.spring(P(t, b(tk), .45)))).toFixed(4) : 1})`; });
    const v = 84 + 7 * M(E.o3(P(t, b(55), .8)));
    srArc.style.strokeDashoffset = (SRC * (1 - v / 100)).toFixed(2); txt(srv, Math.round(v) + '%');
    srv.style.transform = `scale(${(1 + .12 * Math.exp(-Math.max(0, t - b(55.9)) * 8) * (t >= b(55.9) ? 1 : 0)).toFixed(4)})`;
    put(ready, anim(t, { at: b(55.5), dur: .55, ease: E.spring, s: .85, y: 12 }));
  }

  let cv = 0; CUR_VIS.forEach(([a, z]) => { cv = Math.max(cv, clamp((t - b(a)) / .15) * (1 - clamp((t - b(z)) / .12))); });
  if (cv > 0) {
    const [x, y] = curAt(t); let bump = 0, rc = null;
    CLICKS.forEach(([bc]) => { bump = Math.max(bump, clickBump(t, bc)); if (t >= b(bc) && t < b(bc) + .5) rc = bc; });
    put(cur, { op: cv, x, y, s: 1 - .2 * bump });
    if (rc != null && !RM) { const p = P(t, b(rc), .5), [rx, ry] = curAt(b(rc)); put(rip, { op: (1 - p) * .9, x: rx + 4, y: ry + 3, s: .3 + 1.1 * E.o3(p) }); } else rip.style.opacity = 0;
  } else { cur.style.opacity = 0; rip.style.opacity = 0; }
}
function clickBump(t, bc) { const d = t - b(bc); return d > -.06 && d < .16 ? Math.sin(clamp((d + .06) / .22) * Math.PI) : 0; }
