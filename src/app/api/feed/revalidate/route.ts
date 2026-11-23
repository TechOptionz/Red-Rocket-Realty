// Lets an out-of-band import (npm run feed:sync on another machine) refresh the live site's listing pages.
import { revalidateTag } from "next/cache";
import { authorized } from "@/lib/feed/auth";
import { LISTINGS_TAG } from "@/lib/listings/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  revalidateTag(LISTINGS_TAG);
  return Response.json({ ok: true, revalidated: LISTINGS_TAG });
}
