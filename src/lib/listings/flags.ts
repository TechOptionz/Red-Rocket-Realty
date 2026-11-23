// Listing flags in the style of the major Australian portals: "Under contract", "Auction Sat 6 Dec 11:00am",
// "Inspection Wed 26 Nov 5:00pm", "New", "Deposit taken", "Available now", "Sold on 28 Aug 2026".
// Every date is formatted in Queensland time by hand (UTC+10, no DST), so server HTML and the browser always render the same text.
import type { Listing } from "@/data/rr-data";

export type FlagKey = "sold" | "under-contract" | "deposit-taken" | "auction" | "inspection" | "new" | "available" | "new-home" | "house-land";
export type Flag = { key: FlagKey; label: string };

const QLD_OFFSET = 10 * 3600_000;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_MS = 86_400_000;
export const NEW_FOR_DAYS = 7;

/** A wall-clock view of an instant in Queensland. */
const qld = (t: number | string) => new Date((typeof t === "string" ? Date.parse(t) : t) + QLD_OFFSET);
const dayNumber = (t: number | string) => Math.floor((qld(t).getTime()) / DAY_MS);

export const fmtTime = (t: number | string) => {
  const d = qld(t), h = d.getUTCHours(), m = d.getUTCMinutes();
  return `${h % 12 || 12}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
};
/** "Wed 26 Nov" */
export const fmtDay = (t: number | string) => { const d = qld(t); return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; };
/** "28 Aug 2026" */
export const fmtDate = (t: number | string) => { const d = qld(t); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
/** "Today", "Tomorrow" or "Wed 26 Nov", relative to `now`. */
export function fmtRelDay(t: number | string, now: number) {
  const diff = dayNumber(t) - dayNumber(now);
  return diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : fmtDay(t);
}
/** A date-only value ("2026-12-09") as an instant at midnight Queensland time. */
const dateOnly = (s: string) => Date.parse(s + "T00:00:00+10:00");

/** Inspections that haven't finished yet, soonest first. */
export const upcomingInspections = (p: Listing, now: number) => (p.inspections || []).filter((i) => Date.parse(i.end) > now);

export function availableLabel(p: Listing, now: number): string | null {
  if (!p.dateAvailable) return p.available || null;
  return dateOnly(p.dateAvailable) <= now ? "Available now" : "Available " + fmtDay(dateOnly(p.dateAvailable));
}

export function listingFlags(p: Listing, now: number): Flag[] {
  // Static fallback data carries a ready-made status string instead of feed fields.
  if (!p.mode) return p.status ? [{ key: p.status === "Sold" ? "sold" : p.status === "New" ? "new" : "inspection", label: p.status }] : [];

  const out: Flag[] = [];
  if (p.mode === "sold") {
    out.push({ key: "sold", label: p.soldDate ? "Sold on " + fmtDate(dateOnly(p.soldDate)) : "Sold" });
    return out;
  }
  const isNew = !!p.listedAt && now - Date.parse(p.listedAt) < NEW_FOR_DAYS * DAY_MS;
  if (p.mode === "rent") {
    if (p.depositTaken) out.push({ key: "deposit-taken", label: "Deposit taken" });
    else if (isNew) out.push({ key: "new", label: "New" });
  } else {
    if (p.underOffer) out.push({ key: "under-contract", label: "Under contract" });
    else if (isNew) out.push({ key: "new", label: "New" });
    if (p.auctionAt && Date.parse(p.auctionAt) > now) out.push({ key: "auction", label: `Auction ${fmtRelDay(p.auctionAt, now)} ${fmtTime(p.auctionAt)}` });
  }
  const next = upcomingInspections(p, now)[0];
  if (next && !p.depositTaken) {
    const live = Date.parse(next.start) <= now;
    out.push({ key: "inspection", label: live ? `Open now until ${fmtTime(next.end)}` : `Inspection ${fmtRelDay(next.start, now)} ${fmtTime(next.start)}` });
  }
  if (p.mode === "buy") {
    if (p.newConstruction) out.push({ key: "new-home", label: "New home" });
    if (p.homeLand) out.push({ key: "house-land", label: "House & land" });
  }
  return out;
}

/** "5:00–5:30pm", or "11:30am–12:00pm" when the period changes. */
export function fmtRange(start: string, end: string) {
  const a = fmtTime(start), b = fmtTime(end);
  return a.slice(-2) === b.slice(-2) ? a.slice(0, -2) + "–" + b : a + "–" + b;
}
