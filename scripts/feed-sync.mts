// Import LockedOn REAXML files from SFTP into Supabase.
//   npm run feed:sync                 import new files once
//   npm run feed:sync -- --watch      keep checking every 60 s (for a VPS / local dev)
//   npm run feed:sync -- --backfill   first import of an existing portfolio (don't flag everything "New")
//   npm run feed:sync -- --force      re-apply every file, e.g. after a parser change
//   npm run feed:sync -- --force --warm   …and re-render every photo at the sizes the site requests
// With SITE_URL + CRON_SECRET set, the live site is told to refresh its listing pages after changes.
import { syncFeed } from "../src/lib/feed/sync";

const args = new Set(process.argv.slice(2));
const watch = args.has("--watch");
const intervalMs = Number(process.env.FEED_POLL_SECONDS || 60) * 1000;

async function revalidate() {
  const site = process.env.SITE_URL, secret = process.env.CRON_SECRET;
  if (!site || !secret) return;
  const res = await fetch(site.replace(/\/$/, "") + "/api/feed/revalidate", { method: "POST", headers: { Authorization: "Bearer " + secret } }).catch((e) => e as Error);
  console.log(res instanceof Error ? `revalidate failed: ${res.message}` : `revalidate ${site}: ${res.status}`);
}

async function once() {
  const r = await syncFeed({ budgetMs: watch ? 50_000 : 30 * 60_000, force: args.has("--force"), backfill: args.has("--backfill"), warmAll: args.has("--warm"), log: (m) => console.log(m) });
  console.log(`done in ${(r.ms / 1000).toFixed(1)}s: ${r.changed.length} listing(s) changed, ${r.errors.length} error(s)${r.skipped ? " · skipped: " + r.skipped : ""}`);
  if (r.changed.length) await revalidate();
  return r;
}

if (watch) {
  console.log(`watching SFTP every ${intervalMs / 1000}s (Ctrl+C to stop)`);
  for (;;) {
    await once().catch((e) => console.error("sync failed:", e.message));
    await new Promise((r) => setTimeout(r, intervalMs));
  }
} else {
  const r = await once().catch((e) => { console.error("sync failed:", e.message); process.exit(1); });
  process.exit(r.ok ? 0 : 1);
}
