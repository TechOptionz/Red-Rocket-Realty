// Downloads every hot-linked photo (redrocketrealty.com.au uploads + lockedoncloud floorplans)
// into public/photos/ and rewrites the source files to use local /photos/... paths.
// Usage: node scripts/localize-images.mjs            (download + rewrite)
//        node scripts/localize-images.mjs --dry-run  (list only)
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "public", "photos");
const DRY = process.argv.includes("--dry-run");

const RE_UPLOADS = /https:\/\/redrocketrealty\.com\.au\/wp-content\/uploads\/(\d{4})\/(\d{2})\/([^"'\s)]+)/g;
const RE_LOCKED = /https:\/\/resize\.lockedoncloud\.com\/[^/"'\s)]+\/((?:[0-9a-f]{2}\/){15}[0-9a-f]{2}\.(?:jpe?g|png|webp))/g;

function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(tsx?|css|mjs|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function localPath(url) {
  RE_UPLOADS.lastIndex = 0; RE_LOCKED.lastIndex = 0;
  let m = RE_UPLOADS.exec(url);
  if (m) return `uploads/${m[1]}/${m[2]}/${decodeURIComponent(m[3])}`;
  m = RE_LOCKED.exec(url);
  if (m) return `floorplans/${m[1].replace(/\//g, "")}`;
  return null;
}

const files = walk(SRC);
const urls = new Map(); // url -> local relative path
for (const f of files) {
  const txt = readFileSync(f, "utf8");
  for (const re of [RE_UPLOADS, RE_LOCKED]) {
    re.lastIndex = 0;
    for (const m of txt.matchAll(re)) urls.set(m[0], localPath(m[0]));
  }
}
console.log(`Found ${urls.size} unique image URLs in ${files.length} source files.`);
if (DRY) { for (const [u, p] of urls) console.log(p, "<-", u); process.exit(0); }

async function download(url, rel) {
  const dest = join(OUT, rel);
  if (existsSync(dest) && statSync(dest).size > 0) return "cached";
  mkdirSync(dirname(dest), { recursive: true });
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (RedRocketRealty asset sync)" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100) throw new Error("empty body");
      writeFileSync(dest, buf);
      return "downloaded";
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise(r => setTimeout(r, 800 * attempt));
    }
  }
}

const ok = new Map(); const failed = [];
const queue = [...urls.entries()];
let done = 0;
async function worker() {
  while (queue.length) {
    const [url, rel] = queue.shift();
    try { const r = await download(url, rel); ok.set(url, rel); done++; if (done % 50 === 0) console.log(`${done}/${urls.size}`); }
    catch (e) { failed.push([url, String(e.message || e)]); }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
console.log(`Downloaded/cached ${ok.size}, failed ${failed.length}.`);
for (const [u, why] of failed) console.log("FAILED", why, u);

// Rewrite only the URLs that were fetched successfully.
let changedFiles = 0;
for (const f of files) {
  let txt = readFileSync(f, "utf8"); const orig = txt;
  for (const [url, rel] of ok) txt = txt.split(url).join(`/photos/${rel}`);
  if (txt !== orig) { writeFileSync(f, txt); changedFiles++; console.log("rewrote", f.slice(ROOT.length)); }
}
console.log(`Rewrote ${changedFiles} file(s).`);
