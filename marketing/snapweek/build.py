"""Inline fonts (+ audio if present) into the film page.  python build.py [audio.mp3]"""
import base64, sys
from pathlib import Path
H = Path(__file__).parent
b64 = lambda p: base64.b64encode(Path(p).read_bytes()).decode()
html = (H / 'src/film.html').read_text(encoding='utf-8')
html = html.replace('%%FONT_B%%', b64(H / 'fonts/bricolage.woff2')).replace('%%FONT_A%%', b64(H / 'fonts/archivo-narrow.woff2'))
audio = sys.argv[1] if len(sys.argv) > 1 else H / 'out/score.mp3'
html = html.replace('%%AUDIO%%', b64(audio) if Path(audio).exists() else '')
(H / 'out').mkdir(exist_ok=True)
(H / 'out/index.html').write_text(html, encoding='utf-8')
print('built', H / 'out/index.html')
