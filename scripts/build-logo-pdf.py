from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from PIL import Image
import datetime, sys

OUT = sys.argv[1]
B = 'public/brand/'
RED = HexColor('#E6243C'); INK = HexColor('#1A1A1F')
GREY = HexColor('#6B7280'); LINE = HexColor('#E5E7EB'); DARK = HexColor('#18181B')
W, H = landscape(A4)
M = 40
TODAY = datetime.date.today()

OPTIONS = [
  dict(n=1, name='Rocket House', light='logo2-horizontal.png', dark='logo2-horizontal-dark.png',
       extras=[('Stacked', 'logo2-stacked.png', False), ('Stacked / dark', 'logo2-stacked-dark.png', True), ('Emblem', 'logo2-emblem.png', False), ('Emblem / dark', 'logo2-emblem-dark.png', True)],
       blurb='A rocket lifting off through a house silhouette. Home and momentum in a single mark, with a bold geometric wordmark.'),
  dict(n=2, name='Rocket Flight', light='logo3-horizontal.png', dark='logo3-horizontal-dark.png',
       extras=[('Emblem', 'logo3-emblem-dark.png', False), ('Emblem / dark', 'logo3-emblem-white.png', True)],
       blurb='A rocket in full flight beside a tall condensed wordmark. Red accent letters add energy and a sense of speed.'),
  dict(n=3, name='Rocket Tile', light='logo4-horizontal.png', dark='logo4-horizontal-dark.png',
       extras=[('Emblem', 'logo3-emblem-dark.png', False), ('Emblem / dark', 'logo3-emblem-white.png', True)],
       blurb='The rocket sits inside a rounded red tile, app-icon style. Clean and modern, and the tile doubles as a social avatar.'),
  dict(n=4, name='Launch Ring', light='logo5-horizontal.png', dark='logo5-horizontal-dark.png',
       extras=[('Emblem', 'logo3-emblem-dark.png', False), ('Emblem / dark', 'logo3-emblem-white.png', True)],
       blurb='The rocket framed by a thin ring, like a badge or seal. A red rule under the wordmark gives it a refined, established feel.'),
  dict(n=5, name='Lift-off Wordmark', light='logo6-horizontal.png', dark='logo6-horizontal-dark.png',
       extras=[('Emblem', 'logo3-emblem-dark.png', False), ('Emblem / dark', 'logo3-emblem-white.png', True)],
       blurb='Typography leads, with a small rocket taking off from the end of the name. Understated and reads well at any size.'),
  dict(n=6, name='Classic RR', light='logo-horizontal.png', dark='logo-horizontal-dark.png',
       extras=[('Stacked', 'logo-stacked.png', False), ('Stacked / dark', 'logo-stacked-dark.png', True), ('Emblem', 'logo-emblem.png', False), ('Emblem / dark', 'logo-emblem-dark.png', True)],
       blurb='An RR monogram topped with a roofline, in red and navy. Closest to a traditional real estate identity.'),
]

_cache = {}
def img(name):
    if name not in _cache:
        im = Image.open(B + name).convert('RGBA')
        bbox = im.getchannel('A').getbbox()   # trim transparent margins so scaling is consistent
        if bbox:
            im = im.crop(bbox)
        _cache[name] = (ImageReader(im), im.width / im.height)
    return _cache[name]

def fit(c, name, x, y, w, h):
    """Draw image centred inside box (x,y,w,h), preserving aspect."""
    r, ar = img(name)
    iw, ih = (w, w / ar) if w / ar <= h else (h * ar, h)
    c.drawImage(r, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih, mask='auto')

def panel(c, x, y, w, h, dark=False, radius=10):
    c.setFillColor(DARK if dark else white)
    c.setStrokeColor(LINE); c.setLineWidth(0.75)
    c.roundRect(x, y, w, h, radius, stroke=0 if dark else 1, fill=1)

def label(c, x, y, text, color=GREY, size=8.5, bold=False):
    c.setFillColor(color); c.setFont('Helvetica-Bold' if bold else 'Helvetica', size); c.drawString(x, y, text)

def footer(c, page):
    c.setStrokeColor(LINE); c.setLineWidth(0.5); c.line(M, 30, W - M, 30)
    label(c, M, 18, 'Red Rocket Realty  -  Logo options for review  -  ' + TODAY.strftime('%d %B %Y'))
    c.setFont('Helvetica', 8.5); c.setFillColor(GREY); c.drawRightString(W - M, 18, str(page))

def header_mock(c, x, y, w, h, opt, dark):
    """A slim website header bar so the client sees the logo in context."""
    c.setFillColor(DARK if dark else white); c.setStrokeColor(LINE); c.setLineWidth(0.75)
    c.roundRect(x, y, w, h, 6, stroke=0 if dark else 1, fill=1)
    fit(c, opt['dark'] if dark else opt['light'], x + 14, y + 8, 100, h - 16)
    c.setFont('Helvetica', 7); c.setFillColor(HexColor('#D4D4D8') if dark else INK)
    nx = x + w - 14
    for item in reversed(['Buy', 'Sell', 'Team', 'Contact']):
        c.drawRightString(nx, y + h / 2 - 2.5, item)
        nx -= c.stringWidth(item, 'Helvetica', 7) + 12
    c.setFillColor(RED); c.roundRect(nx - 70, y + h / 2 - 9, 64, 18, 9, stroke=0, fill=1)
    c.setFillColor(white); c.setFont('Helvetica-Bold', 7); c.drawCentredString(nx - 38, y + h / 2 - 2.5, 'Free appraisal')

c = canvas.Canvas(OUT, pagesize=(W, H))
c.setTitle('Red Rocket Realty - Logo Options'); c.setAuthor('KEYOB')

# ---------- Cover ----------
c.setFillColor(DARK); c.rect(0, 0, W, H, stroke=0, fill=1)
c.setFillColor(RED); c.rect(0, H - 8, W, 8, stroke=0, fill=1)
label(c, M, H - 80, 'RED ROCKET REALTY', color=HexColor('#A1A1AA'), size=11, bold=True)
c.setFillColor(white); c.setFont('Helvetica-Bold', 40); c.drawString(M, H - 130, 'Logo options')
c.setFont('Helvetica', 13); c.setFillColor(HexColor('#D4D4D8'))
c.drawString(M, H - 158, 'Six directions for review. Each option is shown on light and dark, with its emblem and stacked versions where available.')
c.drawString(M, H - 176, 'Pick the one you like best, or tell us what to combine. The chosen mark will be rolled out across the website.')
gw, gh, gap = (W - 2 * M - 2 * 18) / 3, 108, 18
for i, o in enumerate(OPTIONS):
    gx = M + (i % 3) * (gw + gap); gy = H - 215 - (i // 3 + 1) * (gh + gap) + gap
    c.setFillColor(HexColor('#27272A')); c.roundRect(gx, gy, gw, gh, 8, stroke=0, fill=1)
    fit(c, o['dark'], gx + 16, gy + 26, gw - 32, gh - 38)
    label(c, gx + 12, gy + 10, "OPTION %d   %s" % (o['n'], o['name'].upper()), color=HexColor('#A1A1AA'), size=7.5, bold=True)
label(c, M, 22, TODAY.strftime('%B %Y') + '  -  Prepared by KEYOB', color=HexColor('#71717A'), size=9)
c.showPage()

# ---------- One page per option ----------
for o in OPTIONS:
    c.setFillColor(white); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(RED); c.rect(0, H - 6, W, 6, stroke=0, fill=1)
    label(c, M, H - 44, "OPTION %d OF 6" % o['n'], color=RED, size=9, bold=True)
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 26); c.drawString(M, H - 72, o['name'])
    c.setFont('Helvetica', 10.5); c.setFillColor(GREY); c.drawString(M, H - 92, o['blurb'])

    top = H - 112; ph = 245; pw = (W - 2 * M - 16) / 2
    panel(c, M, top - ph, pw, ph); fit(c, o['light'], M + 28, top - ph + 24, pw - 56, ph - 48)
    label(c, M, top - ph - 13, 'On light backgrounds')
    panel(c, M + pw + 16, top - ph, pw, ph, dark=True); fit(c, o['dark'], M + pw + 44, top - ph + 24, pw - 56, ph - 48)
    label(c, M + pw + 16, top - ph - 13, 'On dark backgrounds')

    by = 48; bh = 128
    ew = 86
    x = M
    for (name, fn, dk) in o['extras']:
        panel(c, x, by + 14, ew, bh - 14, dark=dk, radius=8); fit(c, fn, x + 10, by + 24, ew - 20, bh - 34)
        label(c, x, by + 2, name, size=7.5); x += ew + 10
    label(c, M, by + bh + 8, 'Other formats', color=INK, size=8.5, bold=True)
    mx = x + 14; mw = W - M - mx
    label(c, mx, by + bh + 8, 'In context: website header', color=INK, size=8.5, bold=True)
    header_mock(c, mx, by + bh / 2 + 7, mw, bh / 2 - 7, o, dark=False)
    header_mock(c, mx, by + 2, mw, bh / 2 - 7, o, dark=True)
    footer(c, o['n'] + 1)
    c.showPage()

# ---------- Side by side + choice ----------
c.setFillColor(white); c.rect(0, 0, W, H, stroke=0, fill=1)
c.setFillColor(RED); c.rect(0, H - 6, W, 6, stroke=0, fill=1)
label(c, M, H - 44, 'SIDE BY SIDE', color=RED, size=9, bold=True)
c.setFillColor(INK); c.setFont('Helvetica-Bold', 26); c.drawString(M, H - 72, 'All six at a glance')
c.setFont('Helvetica', 10.5); c.setFillColor(GREY); c.drawString(M, H - 92, 'Tick your preferred option and send this page back, or just reply with the option number.')
gw = (W - 2 * M - 2 * 16) / 3; gh = 168; gap = 16
for i, o in enumerate(OPTIONS):
    gx = M + (i % 3) * (gw + gap); gy = H - 112 - (i // 3 + 1) * (gh + gap) + gap
    panel(c, gx, gy, gw, gh, radius=8)
    fit(c, o['light'], gx + 24, gy + 44, gw - 48, gh - 60)
    c.setStrokeColor(INK); c.setLineWidth(1); c.setFillColor(white); c.rect(gx + 14, gy + 14, 12, 12, stroke=1, fill=1)
    label(c, gx + 32, gy + 17, "Option %d  -  %s" % (o['n'], o['name']), color=INK, size=9.5, bold=True)
footer(c, 8)
c.save()
print('wrote', OUT)
