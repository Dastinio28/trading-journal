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

