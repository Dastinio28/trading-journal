
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
