"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LAND, PAGES, PHOTOS, RENT, SALE, SEARCH, SOLD, type Listing } from "@/data/rr-data";
import PropertyCard from "@/components/PropertyCard";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";
import Photo from "@/components/Photo";

type Mode = "buy" | "rent" | "land" | "sold";
const MODES: Mode[] = ["buy", "rent", "land", "sold"];
const TITLES: Record<Mode, [string, string, string]> = {
  buy: ["Buy", "Properties for sale", "properties for sale"],
  rent: ["Rent", "Properties for rent", "properties for rent"],
  land: ["Buy", "Land for sale", "blocks and packages"],
  sold: ["Sell", "Recently sold", "properties sold"],
};
const SOURCE: Record<Mode, Listing[]> = { buy: SALE, rent: RENT, land: LAND, sold: SOLD };
const PAGE = 6;
const SORTS: [string, string][] = [["new", "Newest"], ["old", "Oldest"], ["hi", "Price · high to low"], ["lo", "Price · low to high"], ["az", "Suburb A–Z"]];

/** Disclosed figure for a listing: weekly rent, or the dollar amount in a price string ("Offers Over $1,200,000", "Sold $945,000"). Undisclosed ("Contact Agent", "Sold") → null. */
function figure(p: Listing, isRent: boolean): number | null {
  if (isRent) return p.rent || null;
  const m = (p.price || "").replace(/,/g, "").match(/\$\s?(\d+(?:\.\d+)?)\s*(k|m)?/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = (m[2] || "").toLowerCase();
  return unit === "m" ? n * 1_000_000 : unit === "k" ? n * 1000 : n;
}

export default function ListingsClient() {
  const sp = useSearchParams();
  const qMode = sp.get("mode");
  const [mode, setMode] = useState<Mode>(MODES.includes(qMode as Mode) ? (qMode as Mode) : "buy");
  const [suburb, setSuburb] = useState(sp.get("suburb") || "");
  const [ptype, setPtype] = useState(sp.get("type") || "");
  const [pfrom, setPfrom] = useState(sp.get("from") || "");
  const [pto, setPto] = useState(sp.get("to") || "");
  const [beds, setBeds] = useState(sp.get("beds") || "");
  const [baths, setBaths] = useState(sp.get("baths") || "");
  const [sort, setSort] = useState("new");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [limit, setLimit] = useState(PAGE);
  const resultsRef = useRef<HTMLElement>(null);

  // Mirror the search in the address bar so a search can be bookmarked or shared.
  useEffect(() => {
    const q = new URLSearchParams({ mode });
    if (suburb) q.set("suburb", suburb);
    if (ptype) q.set("type", ptype);
    if (pfrom) q.set("from", pfrom);
    if (pto) q.set("to", pto);
    if (beds) q.set("beds", beds);
    if (baths) q.set("baths", baths);
    try { history.replaceState(null, "", "?" + q.toString() + window.location.hash); } catch {}
  }, [mode, suburb, ptype, pfrom, pto, beds, baths]);
  useEffect(() => setLimit(PAGE), [mode, suburb, ptype, pfrom, pto, beds, baths, sort]);

  const isRent = mode === "rent";
  const source = SOURCE[mode];
  const pf = Number(pfrom) || 0, pt = Number(pto) || Infinity;
  // Price limits apply to listings with a disclosed figure; "Contact Agent" style listings stay in the results.
  const inRange = (p: Listing) => { const f = figure(p, isRent); return f === null || (f >= pf && f <= pt); };
  const list = source
    .filter((p) => (!suburb || p.suburb === suburb) && (!ptype || p.type === ptype) && (!beds || p.beds >= Number(beds)) && (!baths || p.baths >= Number(baths)) && inRange(p))
    .map((p, i) => ({ p, i, f: figure(p, isRent) }))
    .sort((a, b) => {
      if (sort === "old") return b.i - a.i;
      if (sort === "az") return a.p.suburb.localeCompare(b.p.suburb) || a.i - b.i;
      if (sort === "hi" || sort === "lo") {
        if (a.f === null || b.f === null) return (a.f === null ? 1 : 0) - (b.f === null ? 1 : 0) || a.i - b.i; // undisclosed prices last
        return (sort === "hi" ? b.f - a.f : a.f - b.f) || a.i - b.i;
      }
      return a.i - b.i;
    })
    .map((x) => x.p);
  const results = list.slice(0, limit);
  const suburbs = Array.from(new Set(source.map((p) => p.suburb))).sort();
  const types = Array.from(new Set(source.map((p) => p.type).filter(Boolean) as string[])).sort();
  const prices = isRent ? SEARCH.rentPrices : SEARCH.buyPrices;
  const showType = types.length > 1;
  const showPrice = mode !== "land";
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const active = Boolean(suburb || ptype || pfrom || pto || beds || baths);
  const clear = () => { setSuburb(""); setPtype(""); setPfrom(""); setPto(""); setBeds(""); setBaths(""); };
  const switchMode = (m: Mode) => { setMode(m); clear(); };
  const goToResults = () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const [kicker, title, noun] = TITLES[mode];

  return (
    <main>
      <section className="hero hero--page" style={{ minHeight: "68svh" }}>
        <div className="bsr__bg" aria-hidden="true"><Photo src={PHOTOS.hero.listings} sizes="100vw" priority quality={75} /></div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__body" style={{ paddingBottom: "clamp(88px,10vw,128px)" }}>
        <Crumb tone="light" items={[[kicker]]} />
        <div className="stack-m" style={{ flexWrap: "wrap", gap: 32, alignItems: "flex-end" }}>
          <div style={{ display: "grid", gap: 16 }}>
            <Lines as="h1" className="display-xl" style={{ fontSize: "clamp(2.6rem,1.4rem + 5vw,6.4rem)", letterSpacing: "-.035em", lineHeight: .96 }} lines={[title]} key={mode} />
            <div className="hero__meta" style={{ fontSize: 16 }}><b>{list.length}</b> {noun} · Logan City and surrounding areas</div>
          </div>
          <div role="tablist" aria-label="Listing type" className="seg">
            {MODES.map((m) => (
              <button key={m} type="button" role="tab" aria-selected={m === mode} className="seg__btn" data-on={m === mode ? "1" : "0"} onClick={() => switchMode(m)}>{m === "buy" ? "For sale" : m === "rent" ? "For rent" : m === "land" ? "Land" : "Sold"}</button>
            ))}
          </div>
        </div>
        </div>
      </section>

      <section className="hero-bar">
        <form className="search-bar filters filters--overlap" aria-label="Search listings" onSubmit={(e) => { e.preventDefault(); goToResults(); }}>
          <label className="search-field search-field--sm" style={{ flexBasis: 170 }}><span>Suburb</span><select value={suburb} onChange={(e) => setSuburb(e.target.value)}><option value="">Any suburb</option>{suburbs.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>
          {showType && <label className="search-field search-field--sm" style={{ flexBasis: 150 }}><span>Property type</span><select value={ptype} onChange={(e) => setPtype(e.target.value)}><option value="">Any type</option>{types.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>}
          {showPrice && <label className="search-field search-field--sm" style={{ flexBasis: 130 }}><span>{isRent ? "Rent from" : "Price from"}</span><select value={pfrom} onChange={(e) => setPfrom(e.target.value)}><option value="">Any</option>{prices.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}</select></label>}
          {showPrice && <label className="search-field search-field--sm" style={{ flexBasis: 130 }}><span>{isRent ? "Rent to" : "Price to"}</span><select value={pto} onChange={(e) => setPto(e.target.value)}><option value="">Any</option>{prices.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}</select></label>}
          <label className="search-field search-field--sm" style={{ flexBasis: 110 }}><span>Bedrooms</span><select value={beds} onChange={(e) => setBeds(e.target.value)}><option value="">Any</option>{["1", "2", "3", "4", "5"].map((b) => <option key={b} value={b}>{b}+</option>)}</select></label>
          <label className="search-field search-field--sm" style={{ flexBasis: 110 }}><span>Bathrooms</span><select value={baths} onChange={(e) => setBaths(e.target.value)}><option value="">Any</option>{["1", "2", "3"].map((b) => <option key={b} value={b}>{b}+</option>)}</select></label>
          <div className="filters__foot">
            {active && <button type="button" className="pill pill--link pill--sm" onClick={clear}>Clear all</button>}
            <button type="submit" className="pill pill--red" style={{ height: 48 }}>Search</button>
          </div>
        </form>
      </section>

      <section ref={resultsRef} className="section--bg" style={{ padding: "40px var(--pad-x) var(--sec-y)", scrollMarginTop: 96 }}>
        <div className="results-bar">
          <div style={{ fontSize: 14, color: "var(--grey)", fontWeight: 500 }} aria-live="polite">
            {list.length === 0 ? "No properties match" : <>Showing <b style={{ color: "var(--ink)", fontWeight: 800 }}>{Math.min(limit, list.length)}</b> of <b style={{ color: "var(--ink)", fontWeight: 800 }}>{list.length}</b> {list.length === 1 ? "property" : "properties"}</>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <label className="sort">Sort<select value={sort} onChange={(e) => setSort(e.target.value)}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <div role="group" aria-label="View" className="seg seg--sm hide-m" style={{ padding: 3, gap: 2 }}>
              <button type="button" aria-label="Grid view" aria-pressed={view === "grid"} className="seg__btn" data-on={view === "grid" ? "1" : "0"} onClick={() => setView("grid")}>Grid</button>
              <button type="button" aria-label="List view" aria-pressed={view === "list"} className="seg__btn" data-on={view === "list" ? "1" : "0"} onClick={() => setView("list")}>List</button>
            </div>
          </div>
        </div>
        {list.length > 0 ? (
          <div className={"results results--" + view}>
            {results.map((p) => <PropertyCard key={p.id} p={p} showMeta style={{ opacity: 1 }} />)}
          </div>
        ) : (
          <div className="empty">
            <div className="empty__title">Nothing matches that search yet.</div>
            <p className="body" style={{ lineHeight: 1.55 }}>Widen the price range or suburb, or set a property alert and we&apos;ll email you when a matching listing launches.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}><button type="button" className="pill pill--dark pill--md" onClick={clear}>Clear filters</button><a href="#alerts" className="pill pill--ghost pill--md">Set a property alert</a></div>
          </div>
        )}
        {list.length > limit && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 64 }}>
            <button type="button" className="pill pill--dark" style={{ padding: "0 28px" }} onClick={() => setLimit(limit + PAGE)}>Load more</button>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--grey)" }}>Page {Math.min(Math.ceil(limit / PAGE), pages)} of {pages}</div>
          </div>
        )}
      </section>

      <section id="alerts" className="alerts-band">
        <div className="cta-band">
          <div style={{ display: "grid", gap: 12, maxWidth: 640 }}>
            <div className="kicker">Property alerts</div>
            <h2 className="h2--sm">Want to be kept up to date with the latest listings?</h2>
            <p className="body body--light" style={{ lineHeight: 1.55, maxWidth: "50ch" }}>Set your own alert preferences by suburb, bedrooms, bathrooms and price, and new listings land in your inbox first.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href={PAGES.contact + "?topic=Buying"} className="pill pill--white pill--arrow"><span>Subscribe now!</span><span className="pill__arrow" aria-hidden="true">→</span></Link>
            <Link href={PAGES.appraisal} className="pill pill--ghost-light">Request an appraisal</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
