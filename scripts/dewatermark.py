"""Remove the Red Rocket Realty logo watermark from downloaded listing photos.

Stages:
  python scripts/dewatermark.py build    # learn alpha+colour templates from photo groups -> scripts/wm-templates.npz
  python scripts/dewatermark.py detect   # scan every photo, write scripts/wm-report.json (no changes)
  python scripts/dewatermark.py clean    # unblend + edge inpaint; originals kept in .photos-original/
Run with the venv: .venv-img/Scripts/python.exe
"""
import sys, os, json, shutil, numpy as np, cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS = os.path.join(ROOT, 'public', 'photos', 'uploads')
BACKUP = os.path.join(ROOT, '.photos-original')
TPL = os.path.join(ROOT, 'scripts', 'wm-templates.npz')
REPORT = os.path.join(ROOT, 'scripts', 'wm-report.json')


def all_photos():
    return sorted(os.path.join(r, n) for r, d, f in os.walk(PHOTOS) for n in f
                  if n.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')))


def signal(im, kind):
    f = im.astype(np.float32)
    return f.min(axis=2) if kind == 'white' else f[..., 2] - (f[..., 0] + f[..., 1]) / 2


def highpass(s, k=61):
    base = cv2.medianBlur(np.clip(s + 128, 0, 255).astype(np.uint8), k).astype(np.float32) - 128
    return s - base


# ---------------------------------------------------------------- build
def learn(ims, kind, init_C, crop=None):
    """ims: list of equally sized BGR images. Returns (alpha map, per-pixel colour map) cropped to the logo."""
    if crop:
        ims = [im[crop[0]:, crop[1]:] for im in ims]
    sig = np.stack([highpass(signal(im, kind)) for im in ims])
    d = np.clip(np.median(sig, axis=0), 0, None)
    rough = np.clip(d / np.percentile(d, 99.9), 0, 1)
    roi = rough > 0.3
    sc = np.array([np.corrcoef(s[roi], rough[roi])[0, 1] if roi.sum() > 50 else 0 for s in sig])
    strong = np.where(sc > 0.4)[0]
    if len(strong) < 4:
        strong = np.argsort(-sc)[:max(4, len(ims) // 2)]
    d = np.clip(np.median(sig[strong], axis=0), 0, None)
    mask = (d > 0.3 * np.percentile(d, 99.9)).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask)
    small = np.isin(lab, [i for i in range(1, n) if st[i][4] < 15])
    mask[small] = 0
    # group nearby glyphs into one logo blob (wide horizontal dilation), keep the blob holding the largest glyph
    main = max(range(1, n), key=lambda i: st[i][4] if st[i][4] >= 15 else 0)
    blob = cv2.dilate(mask, np.ones((31, 81), np.uint8))
    nb, lb = cv2.connectedComponents(blob)
    my, mx = st[main][1] + st[main][3] // 2, st[main][0] + st[main][2] // 2
    keep = np.where((lb == lb[my, mx]) & (mask > 0), 255, 0).astype(np.uint8)
    dil = cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    Js = [cv2.inpaint(ims[i], dil, 5, cv2.INPAINT_TELEA).astype(np.float32) for i in strong]
    Is = [ims[i].astype(np.float32) for i in strong]
    C = np.array(init_C, np.float32)
    for _ in range(3):
        al = []
        for I, J in zip(Is, Js):
            den = C - J
            ok = np.abs(den) > 40
            a = np.where(ok, (I - J) / np.where(ok, den, 1), np.nan)
            with np.errstate(all='ignore'):
                al.append(np.nanmedian(a, axis=2))
        with np.errstate(all='ignore'):
            a_map = np.nanmedian(np.stack(al), axis=0)
        a_map = np.clip(np.nan_to_num(a_map), 0, 1)
        a_map[dil == 0] = 0
        sel = a_map > 0.5
        C = np.median(np.concatenate([(I[sel] - (1 - a_map[sel][:, None]) * J[sel]) / a_map[sel][:, None]
                                      for I, J in zip(Is, Js)]), axis=0)
    Cmap = np.zeros(a_map.shape + (3,), np.float32)
    Cmap[:] = C
    sel = a_map > 0.25
    est = np.stack([(I - (1 - a_map[..., None]) * J) / np.maximum(a_map[..., None], 0.25) for I, J in zip(Is, Js)])
    Cmap[sel] = np.clip(np.median(est, axis=0)[sel], 0, 255)
    ys, xs = np.where(keep > 0)
    m = 8
    y0, y1, x0, x1 = max(0, ys.min() - m), ys.max() + m + 1, max(0, xs.min() - m), xs.max() + m + 1
    print(f'  {kind}: {len(strong)}/{len(ims)} strong, colour {C.round(0)}, '
          f'alpha median {np.median(a_map[keep > 0]):.2f}, bbox {x1 - x0}x{y1 - y0}')
    return a_map[y0:y1, x0:x1], Cmap[y0:y1, x0:x1]


def build():
    white, red = [], []
    for p in all_photos():
        im = cv2.imread(p)
        if im is None:
            continue
        if im.shape[:2] == (1333, 2000):
            white.append(im[833:, 1200:].copy())
        elif im.shape[:2] == (768, 1024):
            red.append(im)
    print('building white template from 2000x1333 group')
    aw, cw = learn(white, 'white', (255, 255, 255))
    print('building red template from 1024x768 group')
    ar, cr = learn(red, 'red', (50, 40, 220))
    np.savez_compressed(TPL, white_a=aw, white_c=cw, white_w=2000, red_a=ar, red_c=cr, red_w=1024)
    cv2.imwrite(TPL.replace('.npz', '-white.png'), (aw * 255).astype(np.uint8))
    cv2.imwrite(TPL.replace('.npz', '-red.png'), (ar * 255).astype(np.uint8))


# ---------------------------------------------------------------- detect
def load_templates():
    z = np.load(TPL)
    return {'white': (z['white_a'], z['white_c'], int(z['white_w'])),
            'red': (z['red_a'], z['red_c'], int(z['red_w']))}


DET_W = 1000


def detect(im, tpls):
    h, w = im.shape[:2]
    r = DET_W / w
    small = cv2.resize(im, (DET_W, int(round(h * r))), interpolation=cv2.INTER_AREA)
    best = None
    for kind, (a, c, nat_w) in tpls.items():
        s = highpass(signal(small, kind))
        base_tw = a.shape[1] * DET_W / nat_w
        for sc in np.geomspace(0.3, 1.5, 22):
            tw = int(round(base_tw * sc))
            th = int(round(a.shape[0] * tw / a.shape[1]))
            if tw < 40 or th < 12 or tw >= s.shape[1] or th >= s.shape[0]:
                continue
            t = cv2.resize(a, (tw, th), interpolation=cv2.INTER_AREA)
            res = cv2.matchTemplate(s, t * 100, cv2.TM_CCOEFF_NORMED)
            _, mv, _, ml = cv2.minMaxLoc(res)
            if best is None or mv > best['score']:
                best = {'kind': kind, 'score': float(mv), 'x': ml[0] / r, 'y': ml[1] / r, 'w': tw / r, 'h': th / r}
    return best


_DTPLS = None


def detect_one(p):
    global _DTPLS
    if _DTPLS is None:
        _DTPLS = load_templates()
    im = cv2.imread(p)
    if im is None or im.shape[1] < 400:
        return None
    return os.path.relpath(p, PHOTOS), detect(im, _DTPLS)


def run_detect(workers=None):
    from concurrent.futures import ProcessPoolExecutor
    out = json.load(open(REPORT)) if os.path.exists(REPORT) else {}
    todo = [p for p in all_photos() if os.path.relpath(p, PHOTOS) not in out]
    print('to scan', len(todo), 'already done', len(out), flush=True)
    workers = workers or max(1, (os.cpu_count() or 2) - 1)
    with ProcessPoolExecutor(max_workers=workers) as ex:
        for i, r in enumerate(ex.map(detect_one, todo, chunksize=4)):
            if r:
                out[r[0]] = r[1]
            if i % 50 == 49:
                json.dump(out, open(REPORT, 'w'), indent=1)
                print(i + 1, '/', len(todo), flush=True)
    json.dump(out, open(REPORT, 'w'), indent=1)
    sc = sorted(v['score'] for v in out.values())
    print('scores hist', np.histogram(sc, bins=[0, .2, .3, .4, .5, .6, .7, .8, .9, 1])[0])


def refine(im, det, tpls):
    """Fine scale/position search at full resolution around the coarse detection."""
    a = tpls[det['kind']][0]
    H, W = im.shape[:2]
    x, y, w, h = det['x'], det['y'], det['w'], det['h']
    mx, my = int(w * 0.12) + 8, int(h * 0.3) + 8
    x0, y0 = max(0, int(x - mx)), max(0, int(y - my))
    x1, y1 = min(W, int(x + w + mx)), min(H, int(y + h + my))
    s = highpass(signal(im[y0:y1, x0:x1], det['kind']), 41)
    best = dict(det)
    best['score'] = -1
    for sc in np.linspace(0.90, 1.10, 21):
        tw, th = int(round(w * sc)), int(round(h * sc))
        if tw >= s.shape[1] or th >= s.shape[0] or tw < 20:
            continue
        t = cv2.resize(a, (tw, th), interpolation=cv2.INTER_AREA if tw < a.shape[1] else cv2.INTER_LINEAR)
        res = cv2.matchTemplate(s, t * 100, cv2.TM_CCOEFF_NORMED)
        _, mv, _, ml = cv2.minMaxLoc(res)
        if mv > best['score']:
            best.update(score=float(mv), x=x0 + ml[0], y=y0 + ml[1], w=tw, h=th)
    return best


# ---------------------------------------------------------------- clean
# Coarse-score thresholds per logo kind (chosen from a visual review of the borderline detections).
THRESH = {'white': 0.50, 'red': 0.54}
THRESH_REFINE = 0.50


def accepted(det):
    return det is not None and det['score'] >= THRESH[det['kind']]


MIN_REL_WIDTH = 0.10   # a real logo spans at least 10% of the photo width; smaller hits are noise
ELL = cv2.getStructuringElement


def logo_mask(im, det, tpls):
    """Per-image mask: template footprint AND pixels that deviate from the local background, plus the template core."""
    a = tpls[det['kind']][0]
    x, y, w, h = int(det['x']), int(det['y']), int(det['w']), int(det['h'])
    H, W = im.shape[:2]
    w, h = min(w, W - x), min(h, H - y)
    A = cv2.resize(a, (w, h), interpolation=cv2.INTER_LINEAR)
    core = np.zeros((H, W), np.uint8)
    core[y:y + h, x:x + w] = (A > 0.15) * 255
    foot = np.zeros((H, W), np.uint8)
    foot[y:y + h, x:x + w] = (A > 0.06) * 255
    foot = cv2.dilate(foot, ELL(cv2.MORPH_ELLIPSE, (15, 15)))
    f = im.astype(np.float32)
    base = cv2.medianBlur(im, 31).astype(np.float32)
    dev = np.abs(f - base).max(axis=2) > 18
    if det['kind'] == 'red':
        red = f[..., 2] - (f[..., 0] + f[..., 1]) / 2
        red_base = base[..., 2] - (base[..., 0] + base[..., 1]) / 2
        dev |= (red - red_base) > 8
    m = ((dev & (foot > 0)) * 255).astype(np.uint8)
    m = cv2.bitwise_or(m, core)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    return cv2.dilate(m, ELL(cv2.MORPH_ELLIPSE, (5, 5)))


def remove(im, det, tpls, pad=80):
    """Shift-map (patch based) inpainting of the logo mask, run on a padded crop for speed."""
    mask = logo_mask(im, det, tpls)
    x, y, w, h = int(det['x']), int(det['y']), int(det['w']), int(det['h'])
    H, W = im.shape[:2]
    y0, y1, x0, x1 = max(0, y - pad), min(H, y + h + pad), max(0, x - pad), min(W, x + w + pad)
    crop = im[y0:y1, x0:x1]
    keep = (mask[y0:y1, x0:x1] == 0).astype(np.uint8)
    filled = np.zeros_like(crop)
    cv2.xphoto.inpaint(crop, keep, filled, cv2.xphoto.INPAINT_SHIFTMAP)
    out = im.copy()
    out[y0:y1, x0:x1] = filled
    return out


_TPLS = None


def clean_one(job):
    """Worker: (rel, det) -> status string. Reads the original from the backup, writes the cleaned photo in place."""
    global _TPLS
    if _TPLS is None:
        _TPLS = load_templates()
    rel, det = job
    src = os.path.join(PHOTOS, rel)
    bak = os.path.join(BACKUP, rel)
    if not os.path.exists(bak):
        os.makedirs(os.path.dirname(bak), exist_ok=True)
        shutil.copy2(src, bak)
    im = cv2.imread(bak)
    if det['w'] / im.shape[1] < MIN_REL_WIDTH:
        return 'skip-small'
    det = refine(im, det, _TPLS)
    if det['score'] < THRESH_REFINE:
        return 'skip-refine'
    out = remove(im, det, _TPLS)
    ext = os.path.splitext(src)[1].lower()
    params = [cv2.IMWRITE_JPEG_QUALITY, 93] if ext in ('.jpg', '.jpeg') else []
    cv2.imwrite(src, out, params)
    return 'cleaned'


def run_clean(only=None, workers=None):
    from concurrent.futures import ProcessPoolExecutor
    rep = json.load(open(REPORT))
    jobs = [(rel, det) for rel, det in rep.items()
            if accepted(det) and (not only or any(o in rel for o in only))]
    print('candidates', len(jobs), flush=True)
    log = {}
    workers = workers or max(1, (os.cpu_count() or 2) - 1)
    with ProcessPoolExecutor(max_workers=workers) as ex:
        for (rel, _), status in zip(jobs, ex.map(clean_one, jobs)):
            log[rel] = status
            if len(log) % 20 == 0:
                print(len(log), '/', len(jobs), flush=True)
    json.dump(log, open(os.path.join(ROOT, 'scripts', 'wm-clean-log.json'), 'w'), indent=1)
    from collections import Counter
    print(Counter(log.values()))


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'build':
        build()
    elif cmd == 'detect':
        run_detect()
    elif cmd == 'clean':
        run_clean(sys.argv[2:] or None)
