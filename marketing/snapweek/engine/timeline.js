// SnapWeek reel timeline: one video spec -> absolute timings on a 40 s film clock (played at SPEED, i.e. 36 s).
// Shared by the page (render) and by synth.js (score events).
(function (root) {
  const SPEED = 1 / 0.9, CLOCK = 40, OUTRO = 33;
  const POSE = { L: [-30, 170, 1.04, 4, -9, 0], R: [30, 170, 1.04, 4, 9, 0], C: [0, 170, 1.06, 3, 0, 0], ENTER: [0, 1500, .85, 40, 0, 6], EXIT: [0, -1500, .8, -30, 0, -6] };
  function build(V) {
    const quick = V.intro === 'quick', T0 = quick ? 2.7 : 6.6, span = OUTRO - T0;
    const W = V.scenes.reduce((s, x) => s + (x.d || 5), 0); let cur = T0;
    const scenes = V.scenes.map((s, i) => { const d = (s.d || 5) * span / W, a = cur, z = a + d; cur = z;
      const side = s.cam || ['L', 'R', 'C'][i % 3];
      return { i, page: s.page, a, z, cap: s.cap, side, fullscreen: ['scroll', 'signup'].includes(s.page),
        scroll: (s.scroll || [[0, 0]]).map(([r, y]) => [a + r * d / (s.d || 5), y]),
        hearts: (s.hearts || []).map(r => a + r * d / (s.d || 5)),
        zoom: s.zoom ? { a: a + s.zoom[0] * d / (s.d || 5), z: a + s.zoom[1] * d / (s.d || 5), s: s.zoom[2] || 1.38, y: s.zoom[3] || 120 } : null,
        snap: s.snap ? { k: s.snap[0], side: s.snap[1] || (side === 'R' ? 'L' : 'R'), a: a + (s.snap[2] ?? 1.2) * d / (s.d || 5), z: Math.min(z - .2, a + ((s.snap[2] ?? 1.2) + (s.snap[3] ?? 3.2)) * d / (s.d || 5)) } : null };
    });
    // camera keys [t, pose]
    const cam = [[T0 - .3, POSE.ENTER]];
    scenes.forEach((S, i) => { const p = POSE[S.side];
      cam.push([S.a + (i ? .9 : 1.1), p]);
      if (S.zoom) { const zp = [p[0] * .4, p[1] + S.zoom.y, p[2] * S.zoom.s, 2, p[4] * .4, 0]; cam.push([S.zoom.a, p], [S.zoom.a + .8, zp], [S.zoom.z, zp], [Math.min(S.z, S.zoom.z + .8), p]); }
      cam.push([S.z, p]); });
    cam.push([OUTRO + 1, POSE.EXIT]);
    const ev = [];
    if (!quick) ev.push([3.8, 'impact'], [6.3, 'whoosh']); else ev.push([T0 - .35, 'whoosh']);
    scenes.forEach((S, i) => { if (i) ev.push([S.a - .3, 'whoosh']); S.hearts.forEach(h => ev.push([h, 'pop'])); if (S.snap) ev.push([S.snap.a, 'boing']); if (S.zoom) ev.push([S.zoom.a, 'swish']); });
    ev.push([.9, 'boing'], [OUTRO - .6, 'whoosh'], [OUTRO + .2, 'impact'], [OUTRO + .4, 'boing'], [OUTRO + 1.9, 'pop'], [OUTRO + 2.8, 'pop']);
    return { SPEED, CLOCK, OUTRO, T0, quick, scenes, cam, events: ev.sort((a, b) => a[0] - b[0]), dur: CLOCK / SPEED };
  }
  const api = { build, SPEED, POSE };
  if (typeof module !== 'undefined') module.exports = api; else root.SWTL = api;
})(this);
