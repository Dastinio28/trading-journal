// Writes <out>/manifest.json: the posting queue for a local Claude Code session.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), OUT = path.resolve(process.argv[2] || ROOT + '/../videos');
const V = JSON.parse(fs.readFileSync(ROOT + '/videos.json', 'utf8'));
const items = V.map((v, i) => ({ order: i + 1, id: v.id, title: v.title, features: v.scenes, video: `${v.id}/${v.id}.mp4`, cover: `${v.id}/cover.jpg`, caption_file: `${v.id}/caption.txt`,
  caption: `${v.caption}\n\n${v.hashtags.map(h => '#' + h).join(' ')}`, exists: fs.existsSync(path.join(OUT, v.id, v.id + '.mp4')) }));
items.forEach(it => { const d = path.join(OUT, it.id); if (fs.existsSync(d)) fs.writeFileSync(path.join(d, 'captions.json'), JSON.stringify({ reelCaption: it.caption }, null, 1)); it.captions_json = `${it.id}/captions.json`; });
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ account: '@tradeframe.trading', format: 'Instagram Reel 1080x1920 60fps', cadence: 'one per day, in order', items }, null, 2));
console.log('manifest', items.filter(i => i.exists).length, '/', items.length);
