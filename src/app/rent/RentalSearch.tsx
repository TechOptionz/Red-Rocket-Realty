"use client";
import { useEffect, useState } from "react";
import { CONTACT, SEARCH, type Listing } from "@/data/rr-data";
import PropertyCard from "@/components/PropertyCard";

const PAGE = 9;
const SORTS: [string, string][] = [["new", "Newest"], ["lo", "Rent · low to high"], ["hi", "Rent · high to low"], ["az", "Suburb A–Z"]];
/** Disclosed rent, or null when it is withheld. */
const rentOf = (p: Listing) => (p.mode ? p.priceValue ?? null : p.rent || null);

/** Rentals with the same filters, sort and card grid as the main listings search, embedded in the Rent page. */
export default function RentalSearch({ rentals }: { rentals: Listing[] }) {
  const [suburb, setSuburb] = useState("");
  const [ptype, setPtype] = useState("");
  const [pfrom, setPfrom] = useState("");
  const [pto, setPto] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sort, setSort] = useState("new");
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [suburb, ptype, pfrom, pto, beds, baths, sort]);

  const suburbs = Array.from(new Set(rentals.map((p) => p.suburb))).sort();
  const types = Array.from(new Set(rentals.map((p) => p.type).filter(Boolean) as string[])).sort();
  const pf = Number(pfrom) || 0, pt = Number(pto) || Infinity;
  // Rent limits apply to listings with a disclosed figure; the rest stay in the results.
  const inRange = (p: Listing) => { const f = rentOf(p); return f === null || (f >= pf && f <= pt); };
  const list = rentals
    .filter((p) => (!suburb || p.suburb === suburb) && (!ptype || p.type === ptype) && (!beds || p.beds >= Number(beds)) && (!baths || p.baths >= Number(baths)) && inRange(p))
    .map((p, i) => ({ p, i, f: rentOf(p) }))
    .sort((a, b) => {
      if (sort === "az") return a.p.suburb.localeCompare(b.p.suburb) || a.i - b.i;
      if (sort === "hi" || sort === "lo") {
        if (a.f === null || b.f === null) return (a.f === null ? 1 : 0) - (b.f === null ? 1 : 0) || a.i - b.i; // undisclosed rents last
        return (sort === "hi" ? b.f - a.f : a.f - b.f) || a.i - b.i;
      }
      return a.i - b.i;
    })
    .map((x) => x.p);
  const active = Boolean(suburb || ptype || pfrom || pto || beds || baths);
  const clear = () => { setSuburb(""); setPtype(""); setPfrom(""); setPto(""); setBeds(""); setBaths(""); };

  if (rentals.length === 0) {
    return (
      <div className="empty">
        <div className="empty__title">No rentals are listed right now.</div>
        <p className="body" style={{ lineHeight: 1.55 }}>New rentals are added as soon as they are ready. Call the rentals team on <a href={CONTACT.phoneHref} style={{ color: "var(--ink)", fontWeight: 700 }}>{CONTACT.phone}</a> to hear what is coming up.</p>
      </div>
    );
  }
  return (
    <>
      <form className="search-bar filters" style={{ marginTop: 0, marginBottom: 32 }} aria-label="Search rentals" onSubmit={(e) => e.preventDefault()}>
        <label className="search-field search-field--sm" style={{ flexBasis: 170 }}><span>Suburb</span><select value={suburb} onChange={(e) => setSuburb(e.target.value)}><option value="">Any suburb</option>{suburbs.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>
        {types.length > 1 && <label className="search-field search-field--sm" style={{ flexBasis: 150 }}><span>Property type</span><select value={ptype} onChange={(e) => setPtype(e.target.value)}><option value="">Any type</option>{types.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>}
        <label className="search-field search-field--sm" style={{ flexBasis: 130 }}><span>Rent from</span><select value={pfrom} onChange={(e) => setPfrom(e.target.value)}><option value="">Any</option>{SEARCH.rentPrices.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}</select></label>
        <label className="search-field search-field--sm" style={{ flexBasis: 130 }}><span>Rent to</span><select value={pto} onChange={(e) => setPto(e.target.value)}><option value="">Any</option>{SEARCH.rentPrices.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}</select></label>
        <label className="search-field search-field--sm" style={{ flexBasis: 110 }}><span>Bedrooms</span><select value={beds} onChange={(e) => setBeds(e.target.value)}><option value="">Any</option>{["1", "2", "3", "4", "5"].map((b) => <option key={b} value={b}>{b}+</option>)}</select></label>
        <label className="search-field search-field--sm" style={{ flexBasis: 110 }}><span>Bathrooms</span><select value={baths} onChange={(e) => setBaths(e.target.value)}><option value="">Any</option>{["1", "2", "3"].map((b) => <option key={b} value={b}>{b}+</option>)}</select></label>
      </form>
      <div className="results-bar">
        <div style={{ fontSize: 14, color: "var(--grey)", fontWeight: 500 }} aria-live="polite">
          {list.length === 0 ? "No rentals match" : <>Showing <b style={{ color: "var(--ink)", fontWeight: 800 }}>{Math.min(limit, list.length)}</b> of <b style={{ color: "var(--ink)", fontWeight: 800 }}>{list.length}</b> {list.length === 1 ? "rental" : "rentals"}</>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {active && <button type="button" className="pill pill--link pill--sm" onClick={clear}>Clear filters</button>}
          <label className="sort">Sort<select value={sort} onChange={(e) => setSort(e.target.value)}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        </div>
      </div>
      {list.length > 0 ? (
        <div className="results results--grid">
          {list.slice(0, limit).map((p) => <PropertyCard key={p.id} p={p} showMeta style={{ opacity: 1 }} />)}
        </div>
      ) : (
        <div className="empty">
          <div className="empty__title">Nothing matches that search yet.</div>
          <p className="body" style={{ lineHeight: 1.55 }}>Widen the rent range or suburb to see more rentals.</p>
          <div><button type="button" className="pill pill--dark pill--md" onClick={clear}>Clear filters</button></div>
        </div>
      )}
      {list.length > limit && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 56 }}>
          <button type="button" className="pill pill--dark" style={{ padding: "0 28px" }} onClick={() => setLimit(limit + PAGE)}>Load more</button>
        </div>
      )}
    </>
  );
}
