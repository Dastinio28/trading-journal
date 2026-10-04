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
