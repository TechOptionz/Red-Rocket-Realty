// Polled by Vercel Cron (see vercel.json): picks up new REAXML files from SFTP, writes Supabase, refreshes listing pages.
import { revalidateTag } from "next/cache";
import { authorized } from "@/lib/feed/auth";
import { syncFeed } from "@/lib/feed/sync";
import { LISTINGS_TAG } from "@/lib/listings/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const log: string[] = [];
  try {
    const result = await syncFeed({ budgetMs: 40_000, log: (m) => log.push(m) });
    if (result.changed.length) revalidateTag(LISTINGS_TAG);
    for (const l of log) console.log("[feed]", l);
    return Response.json({ ...result, log }, { status: result.ok ? 200 : 207 });
  } catch (e) {
    console.error("[feed] sync failed", e);
    return Response.json({ ok: false, error: (e as Error).message, log }, { status: 500 });
  }
}
