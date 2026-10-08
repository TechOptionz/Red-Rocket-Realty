"""
Photo asset optimiser for public/photos (run with: python -I scripts/optimize-photos.py [--dry]).

- backs up every file it is about to change into .photos-original/pre-optimize/ (gitignored)
- converts opaque PNG photos to progressive JPEG (q85); an identical sibling .jpg is reused instead
- re-encodes JPEGs larger than 450 KB at q85 progressive when that saves >= 15%
- caps the longest side at 2000 px (the largest size any slot on the site can use)
- rewrites every reference in src/data/rr-data.ts and src/app/appraisal/AppraisalClient.tsx
- writes src/data/floorplan-dims.ts (intrinsic sizes for the floor-plan <Image>s)
The next/image optimizer then derives the responsive AVIF/WebP variants from these sources.
"""
import io, json, os, re, shutil, sys
from PIL import Image, ImageChops, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
DRY = "--dry" in sys.argv
PHOTOS = "public/photos"
BACKUP = ".photos-original/pre-optimize"
REF_FILES = ["src/data/rr-data.ts", "src/app/appraisal/AppraisalClient.tsx"]
MAX_SIDE = 2000
JPEG_Q = 85
REENCODE_ABOVE = 450_000

def encode_jpeg(im):
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=JPEG_Q, optimize=True, progressive=True, subsampling="4:2:0")
    return buf.getvalue()

def same_picture(a, b):
    """Cheap visual identity test: 64px greyscale thumbnails within a small mean difference."""
    ta = ImageOps.grayscale(a).resize((64, 48))
    tb = ImageOps.grayscale(b).resize((64, 48))
    diff = ImageChops.difference(ta, tb)
    h = diff.histogram()
    mean = sum(i * c for i, c in enumerate(h)) / max(1, sum(h))
    return mean < 6

def backup(rel):
    dst = os.path.join(BACKUP, rel)
    if not os.path.exists(dst):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(rel, dst)

renames = {}   # web path -> new web path
stats = {"png_to_jpg": 0, "png_deduped": 0, "jpg_reencoded": 0, "resized": 0, "kept": 0, "before": 0, "after": 0}

for dp, _, fs in os.walk(PHOTOS):
    for fn in sorted(fs):
        rel = os.path.join(dp, fn).replace(os.sep, "/")
        web = "/" + rel[len("public/"):]
        size0 = os.path.getsize(rel)
        stats["before"] += size0
        im = Image.open(rel)
        fmt = im.format
        ext = os.path.splitext(fn)[1].lower()
        base = os.path.splitext(rel)[0]
        changed = False

        # 1. resize cap
        if max(im.size) > MAX_SIDE:
            im = ImageOps.exif_transpose(im)
            im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
            stats["resized"] += 1
            changed = True

        if fmt == "PNG" and web.startswith("/photos/uploads/") and not fn.startswith(("pin-", "favicon-", "logo-")):
            rgb = im.convert("RGB")
            sibling = base + ".jpg"
            if os.path.exists(sibling) and same_picture(rgb, Image.open(sibling)):
                # The agency exported the same shot twice; point the reference at the JPEG and drop the PNG.
                renames[web] = "/" + sibling[len("public/"):]
                stats["png_deduped"] += 1
                if not DRY:
                    backup(rel); os.remove(rel)
                print(f"dedupe  {web} -> {renames[web]}")
                continue
            target = sibling if not os.path.exists(sibling) else base + "-p.jpg"
            data = encode_jpeg(rgb)
            renames[web] = "/" + target[len("public/"):]
            stats["png_to_jpg"] += 1
            stats["after"] += len(data)
            if not DRY:
                backup(rel)
                with open(target, "wb") as f: f.write(data)
                os.remove(rel)
            print(f"png>jpg {web} {size0//1024}K -> {len(data)//1024}K")
            continue

        if fmt in ("JPEG", "MPO") and (changed or size0 > REENCODE_ABOVE):
            rgb = ImageOps.exif_transpose(im).convert("RGB")
            data = encode_jpeg(rgb)
            if changed or len(data) < size0 * 0.85:
                stats["jpg_reencoded"] += 1
                stats["after"] += len(data)
                if not DRY:
                    backup(rel)
                    with open(rel, "wb") as f: f.write(data)
                print(f"jpeg    {web} {size0//1024}K -> {len(data)//1024}K")
                continue

        stats["kept"] += 1
        stats["after"] += size0

# 2. rewrite references
if renames and not DRY:
    for rf in REF_FILES:
        src = open(rf, encoding="utf8").read()
        n = 0
        for old, new in renames.items():
            c = src.count(old)
            if c:
                src = src.replace(old, new); n += c
        open(rf, "w", encoding="utf8", newline="\n").write(src)
        print(f"rewrote {n} references in {rf}")

# 3. floor-plan intrinsic sizes (for width/height on <Image>) so the plans never cause layout shift
dims = {}
fp_dir = os.path.join(PHOTOS, "floorplans")
for fn in sorted(os.listdir(fp_dir)):
    p = os.path.join(fp_dir, fn)
    w, h = Image.open(p).size
    dims["/photos/floorplans/" + fn] = [w, h]
if not DRY:
    with open("src/data/floorplan-dims.ts", "w", encoding="utf8", newline="\n") as f:
        f.write("// Generated by scripts/optimize-photos.py - intrinsic pixel sizes of the floor-plan images.\n")
        f.write("export const FLOORPLAN_DIMS: Record<string, [number, number]> = " + json.dumps(dims, separators=(",", ":")) + ";\n")

print(json.dumps({k: (round(v / 1e6, 1) if k in ("before", "after") else v) for k, v in stats.items()}))
