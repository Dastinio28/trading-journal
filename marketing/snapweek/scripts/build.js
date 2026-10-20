// Build one SnapWeek reel page (all assets inlined).  node scripts/build.js <id> [outDir]
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), A = ROOT + '/assets';
const MIME = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const uri = f => `data:${MIME[path.extname(f)]};base64,` + fs.readFileSync(f).toString('base64');
const PAGEMAP = { home: ['home', 'header', 'tab-home'], theme: ['theme', 'header-pill', 'tab-rank'], discover: ['discover', 'header-pill', 'tab-disc'], explore: ['explore', 'header-pill', 'tab-disc'],
  ranking: ['ranking', 'header-pill', 'tab-rank'], profile: ['profile', 'header-pill', 'tab-prof'], archive: ['archive', 'header-pill', 'tab-home'], why: ['why', 'header-pill', 'tab-home'], scroll: ['scroll'], signup: ['signup'] };
function build(V, outDir) {
  const dir = path.join(outDir, V.id); fs.mkdirSync(dir, { recursive: true });
  const S = `${A}/screens/${V.mode}`, pages = {};
  [...new Set(V.scenes.map(s => s.page))].forEach(p => { const [c, h, t] = PAGEMAP[p]; pages[p] = { cnt: uri(`${S}/${c}.jpg`), hdr: h ? uri(`${S}/${h}.png`) : '', tab: t ? uri(`${S}/${t}.png`) : '' }; });
  const snaps = {}; [V.snapIntro || 'hello', V.snapOutro || 'sit', ...V.scenes.filter(s => s.snap).map(s => s.snap[0])].forEach(k => snaps[k] = uri(`${A}/snappy/snappy-${k}-640.webp`));
  const photos = fs.readdirSync(`${A}/photos`).sort().map(f => uri(`${A}/photos/${f}`));
  const assets = { icon: uri(`${A}/icon.svg`), pages, snappy: snaps, photos: V.intro === 'quick' ? [] : photos };
  const audio = path.join(dir, 'score.mp3');
  let html = fs.readFileSync(ROOT + '/engine/film.html', 'utf8')
    .replace('%%FONT_B%%', fs.readFileSync(ROOT + '/fonts/bricolage.woff2').toString('base64')).replace('%%FONT_A%%', fs.readFileSync(ROOT + '/fonts/archivo-narrow.woff2').toString('base64'))
    .replace('%%TITLE%%', 'SnapWeek · ' + V.title).replace('%%ARIA%%', `SnapWeek reel: ${V.title}. Real app screens with demo profiles, Snappy the mascot, snapweek.web.app`)
    .replace('%%TIMELINE%%', () => fs.readFileSync(ROOT + '/engine/timeline.js', 'utf8'))
    .replace('%%CFG%%', () => JSON.stringify({ V, mode: V.mode, assets }))
    .replace('%%AUDIO%%', () => fs.existsSync(audio) ? fs.readFileSync(audio).toString('base64') : '');
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const cap = `${V.caption}\n\n${V.tags.map(t => '#' + t).join(' ')}\n`;
  fs.writeFileSync(path.join(dir, 'caption.txt'), cap); fs.writeFileSync(path.join(dir, 'captions.json'), JSON.stringify({ reelCaption: cap.trim() }, null, 1));
  return dir;
}
module.exports = { build };
if (require.main === module) { const V = JSON.parse(fs.readFileSync(ROOT + '/videos.json', 'utf8')).find(v => v.id === process.argv[2]); console.log(build(V, path.resolve(process.argv[3] || ROOT + '/videos'))); }
