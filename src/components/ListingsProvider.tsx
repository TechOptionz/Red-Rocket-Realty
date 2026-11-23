"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Listing } from "@/data/rr-data";
import { indexListings, type ListingIndex } from "@/lib/listings/model";

type Ctx = { index: ListingIndex; now: number };
const ListingsContext = createContext<Ctx | null>(null);

/**
 * Live listings for client components (header search, home strips, listings page…), fed once from the root layout.
 * `renderedAt` is the server render time: the first client render uses it so time-based flags ("Inspection today", "New")
 * match the server HTML exactly, then the clock moves to real time after hydration and once a minute.
 */
export default function ListingsProvider({ listings, renderedAt, children }: { listings: Listing[]; renderedAt: number; children: React.ReactNode }) {
  const [now, setNow] = useState(renderedAt);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const index = useMemo(() => indexListings(listings), [listings]);
  const value = useMemo(() => ({ index, now }), [index, now]);
  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings(): ListingIndex {
  const c = useContext(ListingsContext);
  if (!c) throw new Error("useListings must be used inside <ListingsProvider>");
  return c.index;
}

/** Clock for time-based labels; hydration-safe (see ListingsProvider). Falls back to Date.now() outside the provider. */
export function useNow(): number {
  const c = useContext(ListingsContext);
  return c ? c.now : Date.now();
}
