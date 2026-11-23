"use client";
import type { Listing } from "@/data/rr-data";
import { listingFlags, type Flag, type FlagKey } from "@/lib/listings/flags";
import { useNow } from "@/components/ListingsProvider";

const TONE: Record<FlagKey, "red" | "dark" | "white"> = {
  sold: "red", "under-contract": "red", "deposit-taken": "dark", new: "red",
  auction: "dark", inspection: "dark", available: "white", "new-home": "white", "house-land": "white",
};

const CAL = <path d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM4 10h16M8 3v4M16 3v4" />;
const GAVEL = <path d="m14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10M16 16l6-6M8 8l6-6M9 7l8 8M21 11l-8-8" />;

/** Portal-style status flags. `max` limits how many show (cards show the two that matter most). */
export default function ListingFlags({ p, max, variant = "card" }: { p: Listing; max?: number; variant?: "card" | "inline" }) {
  const now = useNow();
  const flags: Flag[] = listingFlags(p, now).slice(0, max);
  if (!flags.length) return null;
  return (
    <div className={"flags flags--" + variant}>
      {flags.map((f) => (
        <span key={f.key} className={"flag flag--" + TONE[f.key]} data-flag={f.key}>
          {f.key === "inspection" || f.key === "auction" ? (
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{f.key === "auction" ? GAVEL : CAL}</svg>
          ) : f.key === "sold" || f.key === "under-contract" || f.key === "new" ? <i aria-hidden="true" /> : null}
          {f.label}
        </span>
      ))}
    </div>
  );
}
