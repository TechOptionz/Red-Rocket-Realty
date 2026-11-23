// Listing collections and search helpers over whatever data the site is running on (Supabase feed or static fallback).
// Client-safe: no server imports.
import type { Listing, SearchMode } from "@/data/rr-data";

export type ListingIndex = ReturnType<typeof indexListings>;

/** Splits a flat list into the site's searches and binds the suburb/type helpers to it. */
export function indexListings(all: Listing[]) {
  const isLand = (p: Listing) => p.type === "Land";
  const mode = (p: Listing): "buy" | "rent" | "sold" => p.mode ?? (p.rent ? "rent" : p.status === "Sold" ? "sold" : "buy");
  const SALE = all.filter((p) => mode(p) === "buy" && !isLand(p));
  const LAND = all.filter((p) => mode(p) === "buy" && isLand(p));
  const RENT = all.filter((p) => mode(p) === "rent");
  const SOLD = all.filter((p) => mode(p) === "sold");
  const BY_MODE: Record<SearchMode, Listing[]> = { buy: SALE, rent: RENT, sold: SOLD, land: LAND };

  /** Suburbs that currently have at least one listing in a mode, busiest first then A–Z, so a search can only ever point at an area with results. */
  const suburbCounts = (m: SearchMode): { name: string; count: number }[] => {
    const c = new Map<string, number>();
    for (const p of BY_MODE[m]) if (p.suburb) c.set(p.suburb, (c.get(p.suburb) || 0) + 1);
    return Array.from(c, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  };
  /** Same suburbs, A–Z, for select menus. */
  const suburbsFor = (m: SearchMode) => suburbCounts(m).map((s) => s.name).sort((a, b) => a.localeCompare(b));
  /** Property types that currently have a listing in a mode. */
  const typesFor = (m: SearchMode) => Array.from(new Set(BY_MODE[m].map((p) => p.type).filter((t): t is string => Boolean(t) && t !== "Land"))).sort();
  /** Resolve free text to a suburb with listings in a mode: exact (case-insensitive) first, else the busiest suburb whose name starts with, then contains, the text. */
  const matchSuburb = (m: SearchMode, text: string): string | null => {
    const t = text.trim().toLowerCase();
    if (!t) return null;
    const subs = suburbCounts(m);
    return (subs.find((s) => s.name.toLowerCase() === t) || subs.find((s) => s.name.toLowerCase().startsWith(t)) || subs.find((s) => s.name.toLowerCase().includes(t)))?.name ?? null;
  };
  return { all, SALE, LAND, RENT, SOLD, BY_MODE, suburbCounts, suburbsFor, typesFor, matchSuburb };
}
