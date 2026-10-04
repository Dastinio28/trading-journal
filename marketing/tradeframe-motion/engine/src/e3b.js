
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
