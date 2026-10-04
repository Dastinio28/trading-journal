import base64,sys
d='/home/user/trading-journal/marketing/'
src=open(d+'src/tradeframe-motion.src.html').read()
b=lambda p: base64.b64encode(open(p,'rb').read()).decode()
src=src.replace('%%SORA700%%',b('/root/.claude/skills/synced/6bd7e281-317f-42fc-bfcf-deede5241e87_69003130-d9b2-4f6f-bd18-dc62af5d5804/tradeframe-instagram/assets/fonts/sora-700.woff2')).replace('%%SORA800%%',b('/root/.claude/skills/synced/6bd7e281-317f-42fc-bfcf-deede5241e87_69003130-d9b2-4f6f-bd18-dc62af5d5804/tradeframe-instagram/assets/fonts/sora-800.woff2')).replace('%%AUDIO%%',b(d+'src/track.mp3'))
open(d+'tradeframe-motion.fragment.html','w').write(src)
open(d+'Tradeframe Motion.html','w').write('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n'+src+'\n</body>\n</html>\n')
print('built', len(src)//1024, 'KB')
