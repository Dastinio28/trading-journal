"""Build the v2 film page: inline fonts, real SnapWeek assets (screens, logo, Snappy), photos and audio.  python build2.py"""
import base64, re
from pathlib import Path
H = Path(__file__).parent
MIME = {'.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg'}
def uri(p):
    p = Path(p); return f"data:{MIME[p.suffix]};base64," + base64.b64encode(p.read_bytes()).decode()
b64 = lambda p: base64.b64encode(Path(p).read_bytes()).decode()
html = (H / 'src/film2.html').read_text(encoding='utf-8')
html = html.replace('%%FONT_B%%', b64(H / 'fonts/bricolage.woff2')).replace('%%FONT_A%%', b64(H / 'fonts/archivo-narrow.woff2'))
html = re.sub(r'%%IMG:([^%]+)%%', lambda m: uri(H / 'assets' / m.group(1)), html)
html = html.replace('%%PHOTOS%%', ','.join(f"'{uri(p)}'" for p in sorted((H / 'assets/photos').glob('*.jpg'))))
a = H / 'out/score2.mp3'
html = html.replace('%%AUDIO%%', b64(a) if a.exists() else '')
(H / 'out').mkdir(exist_ok=True); (H / 'out/index2.html').write_text(html, encoding='utf-8'); print('built out/index2.html', len(html) // 1024, 'KB')
