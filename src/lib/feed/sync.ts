// Feed importer: SFTP folder of REAXML files → public.listings.
// Shared by the cron route (src/app/api/feed/sync) and the CLI (scripts/feed-sync.ts). No Next.js imports here.
import SftpClient from "ssh2-sftp-client";
import sharp from "sharp";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parseReaxml, type FeedImage, type FeedListing, type ParsedListing } from "./reaxml";
import { isLockedOn, lockedOnAt, sourceWidths } from "./lockedon-image";

export type SyncOptions = {
  /** Stop picking up new files after this many ms (serverless time limit). Default 45 s. */
  budgetMs?: number;
  /** Re-apply files already in the ledger and listings whose modTime is unchanged. */
  force?: boolean;
  /** First import of an existing portfolio: don't mark everything as "New". */
  backfill?: boolean;
  /** Re-request every stored photo at the source sizes (e.g. after LockedOn's 180-day cleanup of rendered sizes). */
  warmAll?: boolean;
  log?: (msg: string) => void;
};
export type SyncResult = {
  ok: boolean; skipped?: string; files: number; pending: number; changed: string[]; errors: { file: string; error: string }[]; ms: number;
};

const env = (k: string, required = true) => {
  const v = process.env[k];
  if (!v && required) throw new Error(`Missing env ${k}`);
  return v || "";
};

export function adminClient(): SupabaseClient {
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false, autoRefreshToken: false } });
}

// ── image enrichment: blur placeholder + aspect ratio, and pre-generating the sizes the site will request ──
async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) await fn(items[i++]); }));
}

async function describe(url: string): Promise<Pick<FeedImage, "w" | "h" | "blur">> {
  const res = await fetch(isLockedOn(url) ? lockedOnAt(url, 64, 60) : url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`image ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  const tiny = await sharp(buf).resize(16).webp({ quality: 45 }).toBuffer();
  // Only the ratio of the probe matters; scale to a nominal 2000px so next/image gets sensible intrinsic numbers.
  const w = 2000, h = meta.width && meta.height ? Math.round((2000 * meta.height) / meta.width) : 1333;
  return { w, h, blur: "data:image/webp;base64," + tiny.toString("base64") };
}

/** LockedOn renders a size on first request, then 301s to the stored file. Asking (without following) makes the first visitor's fetch fast. */
const warm = (url: string, widths: number[]) =>
  Promise.all(widths.map((w) => fetch(lockedOnAt(url, w), { redirect: "manual", signal: AbortSignal.timeout(20_000) }).catch(() => undefined)));

async function enrich(row: FeedListing, previous: FeedImage[], log: (m: string) => void, warmAll = false) {
  const known = new Map(previous.filter((p) => p.blur).map((p) => [p.url, p]));
  const fresh: FeedImage[] = [];
  for (const img of [...row.images, ...row.floorplans]) {
    const k = known.get(img.url);
    if (k) Object.assign(img, { w: k.w, h: k.h, blur: k.blur });
    else fresh.push(img);
  }
  const toWarm = (warmAll ? [...row.images, ...row.floorplans] : fresh).filter((i) => isLockedOn(i.url));
  await pool(toWarm, 8, async (img) => { await warm(img.url, sourceWidths(img.url)); });
  if (!fresh.length) return;
  await pool(fresh, 8, async (img) => {
    try { Object.assign(img, await describe(img.url)); } catch (e) { log(`  image probe failed ${img.url}: ${(e as Error).message}`); }
  });
  log(`  ${fresh.length} new image(s) processed`);
}

// ── apply one parsed listing ─────────────────────────────────────────────────
type Existing = { unique_id: string; mod_time: string; listed_at: string | null; images: FeedImage[]; floorplans: FeedImage[]; status: string };

async function apply(db: SupabaseClient, p: ParsedListing, file: string, opts: SyncOptions, log: (m: string) => void): Promise<"applied" | "stale" | "unchanged" | "ignored"> {
  const { row, partial } = p;
  const { data: ex, error } = await db.from("listings").select("unique_id,mod_time,listed_at,images,floorplans,status").eq("unique_id", row.unique_id).maybeSingle<Existing>();
  if (error) throw new Error(error.message);
  const incoming = Date.parse(row.mod_time), stored = ex ? Date.parse(ex.mod_time) : -Infinity;
  if (ex && incoming < stored) return "stale"; // an older file arrived late: never overwrite newer data
  if (ex && incoming === stored && ex.status === row.status && !opts.force) return "unchanged";
  const now = new Date().toISOString();

  if (partial) {
    // withdrawn / off market / leased: hide it, keep the rest of the record.
    if (!ex) return "ignored";
    const { error: e } = await db.from("listings").update({ status: row.status, mod_time: row.mod_time, source_file: file, updated_at: now }).eq("unique_id", row.unique_id);
    if (e) throw new Error(e.message);
    log(`  ${row.slug}: ${ex.status} → ${row.status}`);
    return "applied";
  }

  await enrich(row, ex ? [...(ex.images || []), ...(ex.floorplans || [])] : [], log, opts.warmAll);
  const listed_at = ex?.listed_at ?? (opts.backfill || row.status !== "current" ? null : now);
  const { error: e } = await db.from("listings").upsert({ ...row, listed_at, source_file: file, updated_at: now }, { onConflict: "unique_id" });
  if (e) throw new Error(e.message);
  log(`  ${row.slug}: ${ex ? ex.status + " → " : "new, "}${row.status} (${row.kind})`);
  return "applied";
}

// ── main entry ───────────────────────────────────────────────────────────────
export async function syncFeed(opts: SyncOptions = {}): Promise<SyncResult> {
  const t0 = Date.now();
  const budget = opts.budgetMs ?? 45_000;
  const log = opts.log ?? (() => {});
  const db = adminClient();
  const holder = "sync-" + Math.random().toString(36).slice(2, 10);
  const result: SyncResult = { ok: true, files: 0, pending: 0, changed: [], errors: [], ms: 0 };

  const { data: locked, error: lockErr } = await db.rpc("feed_try_lock", { p_holder: holder, p_ttl_seconds: Math.ceil(budget / 1000) + 60 });
  if (lockErr) throw new Error("lock: " + lockErr.message);
  if (!locked) return { ...result, skipped: "another sync is running", ms: Date.now() - t0 };

  const sftp = new SftpClient();
  try {
    await sftp.connect({ host: env("SFTP_HOST"), port: Number(env("SFTP_PORT", false) || 22), username: env("SFTP_USER"), password: env("SFTP_PASSWORD"), readyTimeout: 15_000 });
    const dir = (env("SFTP_DIR", false) || ".").replace(/\/$/, "");
    const archive = env("SFTP_ARCHIVE_DIR", false).replace(/\/$/, "");
    const listing = (await sftp.list(dir)).filter((f) => f.type === "-" && /\.xml$/i.test(f.name));
    result.files = listing.length;

    // Which of these are new? Look them up in the ledger in chunks.
    const done = new Map<string, { size: number; status: string }>();
    for (let i = 0; i < listing.length; i += 200) {
      const names = listing.slice(i, i + 200).map((f) => f.name);
      const { data, error } = await db.from("feed_files").select("name,size,status").in("name", names);
      if (error) throw new Error(error.message);
      for (const r of data || []) done.set(r.name, { size: Number(r.size), status: r.status });
    }
    // Oldest first, so later updates to the same listing win. LockedOn names start with an increasing sequence number.
    const seq = (n: string) => Number(/^(\d+)/.exec(n)?.[1] ?? Infinity);
    const pending = listing
      .filter((f) => opts.force || !done.has(f.name) || done.get(f.name)!.size !== f.size)
      .sort((a, b) => a.modifyTime - b.modifyTime || seq(a.name) - seq(b.name) || a.name.localeCompare(b.name));
    result.pending = pending.length;
    log(`${listing.length} xml file(s) in ${dir}, ${pending.length} to import`);

    for (const f of pending) {
      if (Date.now() - t0 > budget) { log(`time budget reached, ${pending.length - pending.indexOf(f)} file(s) left for the next run`); break; }
      const path = `${dir}/${f.name}`;
      const touched: string[] = [];
      try {
        const xml = ((await sftp.get(path)) as Buffer).toString("utf8");
        const parsed = parseReaxml(xml);
        log(`${f.name}: ${parsed.length} listing(s)`);
        for (const p of parsed) {
          const r = await apply(db, p, f.name, opts, log);
          touched.push(p.row.unique_id);
          if (r === "applied") result.changed.push(p.row.slug);
          else log(`  ${p.row.slug}: ${r}`);
        }
        await db.from("feed_files").upsert({ name: f.name, size: f.size, remote_mtime: new Date(f.modifyTime).toISOString(), status: parsed.length ? "ok" : "ignored", error: null, listings: touched, processed_at: new Date().toISOString() });
        if (archive) await sftp.rename(path, `${archive}/${f.name}`).catch((e) => log(`  archive failed: ${e.message}`));
      } catch (e) {
        const msg = (e as Error).message;
        result.errors.push({ file: f.name, error: msg });
        log(`${f.name}: ERROR ${msg}`);
        // Recorded with status=error so a broken file doesn't block the queue; --force (or deleting the ledger row) retries it.
        await db.from("feed_files").upsert({ name: f.name, size: f.size, remote_mtime: new Date(f.modifyTime).toISOString(), status: "error", error: msg.slice(0, 2000), listings: touched, processed_at: new Date().toISOString() });
      }
    }
  } finally {
    await sftp.end().catch(() => {});
    await db.rpc("feed_release_lock", { p_holder: holder });
  }
  result.ok = result.errors.length === 0;
  result.ms = Date.now() - t0;
  return result;
}
