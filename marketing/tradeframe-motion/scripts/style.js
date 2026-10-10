// Per-video "packaging" style: hook font, caption mode, background, grain, HUD, card palette, flash colour.
// The app UI itself never changes (it must stay faithful to Tradeframe). V.style overrides; otherwise legacy look.
const FONTS = {
  sora: { fam: null, css: '800 300px/.92 var(--display)', ls: '-.055em' },
  anton: { fam: 'Anton', css: '400 330px/.9 "Anton",sans-serif', ls: '-.01em' },
  bebas: { fam: 'Bebas+Neue', css: '400 360px/.86 "Bebas Neue",sans-serif', ls: '0' },
  archivo: { fam: 'Archivo+Black', css: '400 270px/.92 "Archivo Black",sans-serif', ls: '-.04em' },
  serif: { fam: 'Instrument+Serif:ital@1', css: 'italic 400 330px/.9 "Instrument Serif",serif', ls: '-.03em' },
};
const CAPF = { sora: '800 92px/1.04 var(--display)', anton: '400 104px/1.02 "Anton",sans-serif', bebas: '400 118px/.98 "Bebas Neue",sans-serif', archivo: '400 84px/1.06 "Archivo Black",sans-serif', serif: 'italic 400 110px/1 "Instrument Serif",serif' };
// Text colours stay in the Tradeframe cyan/violet family (Dastan, 10/10/2026: no gold or other hues on text).
const ACC = { brand: ['#5eead4', '#a78bfa'], electric: ['#22d3ee', '#8b5cf6'], soft: ['#99f6e4', '#c4b5fd'] };
const PACKS = { // curated combinations so every pack reads as its own "look"
  legacy: {},
  terminal: { font: 'archivo', caps: 'karaoke', bg: 'grid', grain: .05, hud: 1, cards: 'dark', flash: 'accent', acc: 'electric', hl: 'grad', drop: 'glass' },
  luxe: { font: 'serif', caps: 'top', bg: 'none', grain: .07, hud: 0, cards: 'accent', flash: 'black', acc: 'soft', hl: 'glass', drop: 'glass' },
  street: { font: 'anton', caps: 'karaoke', bg: 'lines', grain: .09, hud: 1, cards: 'accent', flash: 'white', acc: 'brand', hl: 'glass', drop: 'glass' },
  clean: { font: 'bebas', caps: 'karaoke', bg: 'dots', grain: .03, hud: 0, cards: 'mono', flash: 'accent', acc: 'electric', hl: 'glass', drop: 'glass' },
  night: { font: 'anton', caps: 'top', bg: 'grid', grain: .06, hud: 1, cards: 'dark', flash: 'accent', acc: 'brand', hl: 'grad', drop: 'glass' },
};
function resolve(V) { const p = V.style && V.style.pack ? PACKS[V.style.pack] || {} : {}; return { ...p, ...(V.style || {}) }; }
function css(S) {
  if (!Object.keys(S).length || S.pack === 'legacy') return { link: '', style: '' };
  const F = FONTS[S.font] || FONTS.sora, [a1, a2] = ACC[S.acc] || ACC.brand, out = [];
  out.push(`.sb{font:${F.css};letter-spacing:${F.ls}}`, `.sub2,#ot .ol{letter-spacing:${S.font === 'sora' || !S.font ? '-.045em' : S.font === 'archivo' ? '-.02em' : '.005em'}}`, `#ot .ol{font-family:${F.css.split(' ').slice(-1)[0].includes('serif') || F.fam ? F.css.replace(/^.*?\/[.\d]+ /, '') : 'var(--display)'}}`, `.slam .ss{color:${a1}!important}`);
  out.push(`.th-d .g,.slam .g{background:linear-gradient(90deg,${a1},${a2});-webkit-background-clip:text;background-clip:text;color:transparent}`);
  if (S.cards === 'accent') out.push(`.slam.th-l{background:linear-gradient(135deg,${a1},${a2});color:#0b0d12}.th-l .g{background:none;-webkit-background-clip:initial;background-clip:initial;color:#0b0d12;text-decoration:underline;text-decoration-thickness:.06em;text-underline-offset:.08em}.th-l .ss{color:#0b0d12!important}.th-l .gq{background:${a1}}`);
  if (S.cards === 'dark') out.push(`.slam.th-l{background:radial-gradient(900px 700px at 50% 40%,${a1}26,transparent 70%),#07080c;color:#fff}.th-l .g{background:linear-gradient(90deg,${a1},${a2});-webkit-background-clip:text;background-clip:text;color:transparent}.th-l .gq{background:#07080c}`);
  if (S.bg === 'grid') out.push(`.dots{background-image:linear-gradient(rgba(255,255,255,.06) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.06) 2px,transparent 2px);background-size:80px 80px}`);
  if (S.bg === 'lines') out.push(`.dots{background-image:repeating-linear-gradient(-35deg,rgba(255,255,255,.045) 0 3px,transparent 3px 46px)}`);
  if (S.bg === 'none') out.push(`.dots{display:none}`);
  if (S.flash === 'accent') out.push(`.flash{background:${a1}}`); if (S.flash === 'black') out.push(`.flash{background:#000}`);
  if (S.caps === 'karaoke') out.push(`.subs{top:auto;bottom:300px;left:70px;right:70px;text-align:center}`, `.sub2{top:auto;bottom:0;font:${CAPF[S.font] || CAPF.sora};text-transform:uppercase;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.65)}`,
    `.sub2 .wi.g{background:none;-webkit-background-clip:initial;background-clip:initial;color:${a1}}`, `.sub2 .wi{padding:0 .08em;border-radius:.12em}`, (S.hl === 'glass'
      ? `.sub2 .wi.kon{background:linear-gradient(180deg,rgba(255,255,255,.26),rgba(255,255,255,.08));backdrop-filter:blur(16px) saturate(170%);-webkit-backdrop-filter:blur(16px) saturate(170%);border:2px solid rgba(255,255,255,.38);box-shadow:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -10px 22px ${a1}33,inset 0 0 0 1px ${a2}22,0 10px 30px rgba(0,0,0,.45);color:#fff!important;-webkit-text-fill-color:#fff;padding:0 .14em;border-radius:.22em}`
      : `.sub2 .wi.kon{background:linear-gradient(90deg,${a1},${a2});color:#0b0d12!important;-webkit-text-fill-color:#0b0d12}`));
  else out.push(`.sub2{font:${CAPF[S.font] || CAPF.sora}}`, `.sub2 .wi.g{background:linear-gradient(90deg,${a1},${a2});-webkit-background-clip:text;background-clip:text;color:transparent}`);
  if (S.drop === 'glass') out.push(`.ringx{border:2px solid rgba(255,255,255,.42);background:radial-gradient(circle,rgba(255,255,255,.07),rgba(255,255,255,.015) 62%,transparent 71%);backdrop-filter:blur(10px) saturate(170%);-webkit-backdrop-filter:blur(10px) saturate(170%);box-shadow:inset 0 0 50px ${a1}40,inset 0 3px 0 rgba(255,255,255,.45),inset 0 -6px 30px ${a2}33}`,
    `.mark{overflow:hidden;box-shadow:0 30px 120px ${a1}44,inset 0 3px 0 rgba(255,255,255,.55),inset 0 -14px 40px rgba(0,0,0,.18)}`, `.msw{position:absolute;top:-40px;bottom:-40px;left:0;width:90px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);opacity:0;pointer-events:none}`);
  if (S.grain) out.push(`#grain{position:absolute;inset:0;width:1080px;height:1920px;opacity:${S.grain};mix-blend-mode:overlay;pointer-events:none;image-rendering:pixelated}`);
  out.push(`#vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 90% at 50% 45%,transparent 55%,rgba(0,0,0,.55))}`);
  if (S.hud) out.push(`.hud{position:absolute;font:700 30px/1 var(--mono);letter-spacing:.14em;color:rgba(255,255,255,.82);text-shadow:0 2px 10px rgba(0,0,0,.6);pointer-events:none}`,
    `#hud-rec{left:64px;top:112px}#hud-rec i{display:inline-block;width:22px;height:22px;border-radius:50%;background:#ef4444;margin-right:14px;vertical-align:-2px}`, `#hud-tc{right:64px;top:112px}`,
    `.hud.br{width:70px;height:70px;border-color:rgba(255,255,255,.7);border-style:solid;border-width:0}`, `#hb1{left:40px;top:40px;border-left-width:5px;border-top-width:5px}#hb2{right:40px;top:40px;border-right-width:5px;border-top-width:5px}#hb3{left:40px;bottom:40px;border-left-width:5px;border-bottom-width:5px}#hb4{right:40px;bottom:40px;border-right-width:5px;border-bottom-width:5px}`);
  const fams = [F.fam, FONTS[S.font] && FONTS[S.font].fam].filter(Boolean);
  const link = fams.length ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${[...new Set(fams)].map(f => 'family=' + f).join('&')}&display=swap">` : '';
  return { link, style: `<style>${out.join('\n')}</style>` };
}
function html(S) {
  if (!Object.keys(S).length || S.pack === 'legacy') return '';
  return `<style>${fontFaces(S)}</style>` + css(S).style + `${S.grain ? '<canvas id="grain" width="540" height="960"></canvas>' : ''}<div id="vig"></div>${S.hud ? '<div class="hud" id="hud-rec"><i></i>REC</div><div class="hud" id="hud-tc">00:00:00:00</div><i class="hud br" id="hb1"></i><i class="hud br" id="hb2"></i><i class="hud br" id="hb3"></i><i class="hud br" id="hb4"></i>' : ''}`;
}
const FF = [['Anton', 'anton', 'normal', '400'], ['Bebas Neue', 'bebas', 'normal', '400'], ['Archivo Black', 'archivo', 'normal', '400'], ['Instrument Serif', 'serif', 'italic', '400'],
  ['Caveat', 'caveat', 'normal', '700'], ['Manrope', 'manrope', 'normal', '500 800'], ['Roboto Mono', 'robotomono', 'normal', '500 700']];
// Embedded @font-face (headless renders cannot rely on Google Fonts being reachable).
function fontFaces(S) { const fs = require('fs'), dir = require('path').resolve(__dirname, '../assets/fonts'), need = { anton: 'Anton', bebas: 'Bebas Neue', archivo: 'Archivo Black', serif: 'Instrument Serif' }[S.font];
  return FF.filter(f => f[1] === 'caveat' || f[1] === 'manrope' || f[1] === 'robotomono' || f[0] === need)
    .map(([fam, file, st, w]) => `@font-face{font-family:"${fam}";font-style:${st};font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${fs.readFileSync(dir + '/' + file + '.woff2').toString('base64')}) format("woff2")}`).join('\n'); }
module.exports = { PACKS, resolve, css, html, fontFaces };
