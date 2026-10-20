// Posting queue for a local Claude Code session.  node scripts/manifest.js [outDir]
const fs = require('fs'), path = require('path'); const ROOT = path.resolve(__dirname, '..'), OUT = path.resolve(process.argv[2] || ROOT + '/videos');
const V = JSON.parse(fs.readFileSync(ROOT + '/videos.json', 'utf8'));
// alternate: general, feature, general, feature...
const G = V.filter(v => v.kind === 'general'), F = V.filter(v => v.kind === 'feature'), order = G.flatMap((g, i) => [g, F[i]]).filter(Boolean);
const items = order.map((v, i) => ({ order: i + 1, id: v.id, kind: v.kind, title: v.title, video: `${v.id}/${v.id}.mp4`, cover: `${v.id}/cover.jpg`, captions_json: `${v.id}/captions.json`, caption_file: `${v.id}/caption.txt`, exists: fs.existsSync(path.join(OUT, v.id, v.id + '.mp4')) }));
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ account: 'SnapWeek Instagram account', format: 'Instagram Reel 1080x1920 60fps, 36 s, music inside', cadence: 'one per day, in order', items }, null, 2));
console.log('manifest', items.filter(i => i.exists).length, '/', items.length);
