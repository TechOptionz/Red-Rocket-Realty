"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LAND, PAGES, PHOTOS, RENT, SALE, SEARCH, SOLD, type Listing } from "@/data/rr-data";
import PropertyCard from "@/components/PropertyCard";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";
import Photo from "@/components/Photo";

type Mode = "buy" | "rent" | "land" | "sold";
const TITLES: Record<Mode, [string, string, string]> = {
  buy: ["Buy", "Properties for sale", "properties for sale"],
  rent: ["Rent", "Properties for rent", "properties for rent"],
  land: ["Buy", "Land for sale", "blocks and packages"],
  sold: ["Sell", "Recently sold", "properties sold"],
};
const SOURCE: Record<Mode, Listing[]> = { buy: SALE, rent: RENT, land: LAND, sold: SOLD };
const PAGE = 6;

export default function ListingsClient() {
  const sp = useSearchParams();
  const qMode = sp.get("mode");
  const [mode, setMode] = useState<Mode>((["buy", "rent", "land", "sold"] as Mode[]).includes(qMode as Mode) ? (qMode as Mode) : "buy");
  const [suburb, setSuburb] = useState(sp.get("suburb") || "");
  const [ptype, setPtype] = useState(sp.get("type") || "");
  const [pfrom, setPfrom] = useState(sp.get("from") || "");
  const [pto, setPto] = useState(sp.get("to") || "");
  const [bmin, setBmin] = useState(sp.get("beds") || "");
  const [bmax, setBmax] = useState("");
  const [baths, setBaths] = useState("");
  const [sort, setSort] = useState("new");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [limit, setLimit] = useState(PAGE);

  // keep the address bar shareable
  useEffect(() => {
    const q = new URLSearchParams({ mode });
    if (suburb) q.set("suburb", suburb);
    if (ptype) q.set("type", ptype);
    if (pfrom) q.set("from", pfrom);
    if (pto) q.set("to", pto);
    if (bmin) q.set("beds", bmin);
    try { history.replaceState(null, "", "?" + q.toString() + window.location.hash); } catch {}
  }, [mode, suburb, ptype, pfrom, pto, bmin]);
  useEffect(() => setLimit(PAGE), [mode, suburb, ptype, pfrom, pto, bmin, bmax, baths]);

  const isRent = mode === "rent";
  const source = SOURCE[mode];
  const pf = Number(pfrom) || 0, pt = Number(pto) || Infinity;
  let list = source.filter((p) => (!suburb || p.suburb === suburb) && (!ptype || p.type === ptype) && (!bmin || p.beds >= Number(bmin)) && (!bmax || p.beds <= Number(bmax)) && (!baths || p.baths >= Number(baths)) && (!isRent || ((p.rent || 0) >= pf && (p.rent || 0) <= pt)));
  if (sort === "old") list = list.slice().reverse();
  if (sort === "az") list = list.slice().sort((a, b) => a.suburb.localeCompare(b.suburb));
  if (sort === "za") list = list.slice().sort((a, b) => b.suburb.localeCompare(a.suburb));
  if (sort === "hi") list = list.slice().sort((a, b) => (b.rent || 0) - (a.rent || 0));
  if (sort === "lo") list = list.slice().sort((a, b) => (a.rent || 0) - (b.rent || 0));
  const results = list.slice(0, limit);
  const suburbs = Array.from(new Set(source.map((p) => p.suburb))).sort();
  const types = Array.from(new Set(source.map((p) => p.type).filter(Boolean) as string[])).sort();
  const prices = isRent ? SEARCH.rentPrices : SEARCH.buyPrices;
  const sortOptions = [["new", "Date · newest first"], ["old", "Date · oldest first"], ["az", "Suburb A–Z"], ["za", "Suburb Z–A"]].concat(isRent ? [["hi", "Rent · high to low"], ["lo", "Rent · low to high"]] : []);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const clear = () => { setSuburb(""); setPtype(""); setPfrom(""); setPto(""); setBmin(""); setBmax(""); setBaths(""); };
  const switchMode = (m: Mode) => { setMode(m); setSuburb(""); setPtype(""); setPfrom(""); setPto(""); };
  const [kicker, title, noun] = TITLES[mode];

  return (
    <main>
      <section className="hero hero--page" style={{ minHeight: "68svh" }}>
        <div className="bsr__bg" aria-hidden="true"><Photo src={PHOTOS.hero.listings} sizes="100vw" priority quality={70} /></div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__body" style={{ paddingBottom: "clamp(88px,10vw,128px)" }}>
        <Crumb tone="light" items={[[kicker]]} />
        <div className="stack-m" style={{ flexWrap: "wrap", gap: 32, alignItems: "flex-end" }}>
          <div style={{ display: "grid", gap: 16 }}>
            <Lines as="h1" className="display-xl" style={{ fontSize: "clamp(2.6rem,1.4rem + 5vw,6.4rem)", letterSpacing: "-.035em", lineHeight: .96 }} lines={[title]} key={mode} />
            <div className="hero__meta" style={{ fontSize: 16 }}><b>{list.length}</b> {noun} · Logan City and surrounding areas</div>
          </div>
          <div role="tablist" aria-label="Listing type" className="seg">
            {(["buy", "rent", "land", "sold"] as Mode[]).map((m) => (
              <button key={m} type="button" role="tab" className="seg__btn" data-on={m === mode ? "1" : "0"} onClick={() => switchMode(m)}>{m === "buy" ? "For sale" : m === "rent" ? "For rent" : m === "land" ? "Land" : "Sold"}</button>
            ))}
          </div>
        </div>
        </div>
      </section>

      <section className="hero-bar">
        <form className="search-bar filters filters--overlap" onSubmit={(e) => e.preventDefault()}>
          <label className="search-field search-field--sm" style={{ flexBasis: 160 }}><span>Suburb</span><select value={suburb} onChange={(e) => setSuburb(e.target.value)}><option value="">Any suburb</option>{suburbs.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>
          <label className="search-field search-field--sm" style={{ flexBasis: 140 }}><span>Property type</span><select value={ptype} onChange={(e) => setPtype(e.target.value)}><option value="">Any type</option>{types.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>
          <label className="search-field search-field--sm" style={{ flexBasis: 120 }}><span>{isRent ? "Rent from" : "Price from"}</span><select value={pfrom} onChange={(e) => setPfrom(e.target.value)}><option value="">Any</option>{prices.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}</select></label>
          <label className="search-field search-field--sm" style={{ flexBasis: 120 }}><span>{isRent ? "Rent to" : "Price to"}</span><select value={pto} onChange={(e) => setPto(e.target.value)}><option value="">Any</option>{prices.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}</select></label>
          <label className="search-field search-field--sm" style={{ flexBasis: 110 }}><span>Beds min</span><select value={bmin} onChange={(e) => setBmin(e.target.value)}><option value="">Any</option>{["1", "2", "3", "4", "5"].map((b) => <option key={b} value={b}>{b}+</option>)}</select></label>
          <label className="search-field search-field--sm" style={{ flexBasis: 110 }}><span>Beds max</span><select value={bmax} onChange={(e) => setBmax(e.target.value)}><option value="">Any</option>{["1", "2", "3", "4", "5"].map((b) => <option key={b} value={b}>{b}</option>)}</select></label>
          <label className="search-field search-field--sm" style={{ flexBasis: 110 }}><span>Bathrooms</span><select value={baths} onChange={(e) => setBaths(e.target.value)}><option value="">Any</option>{["1", "2", "3"].map((b) => <option key={b} value={b}>{b}+</option>)}</select></label>
          <div className="filters__foot">
            <div className="filters__checks">
              <label><input type="checkbox" />Air conditioning</label>
              <label><input type="checkbox" />Pool</label>
              <label><input type="checkbox" />Security</label>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button type="button" className="pill pill--link pill--sm" onClick={clear}>Clear</button>
              <button type="submit" className="pill pill--red" style={{ height: 48 }}>Search</button>
            </div>
          </div>
        </form>
      </section>

      <section className="section--bg" style={{ padding: "40px var(--pad-x) var(--sec-y)" }}>
        <div className="results-bar">
          <div style={{ fontSize: 14, color: "var(--grey)", fontWeight: 500 }}>Showing <b style={{ color: "var(--ink)", fontWeight: 800 }}>{Math.min(limit, list.length)}</b> of {list.length} · newest first unless sorted · search is shareable from the page address</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <label className="sort">Sort<select value={sort} onChange={(e) => setSort(e.target.value)}>{sortOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <div role="group" aria-label="View" className="seg seg--sm hide-m" style={{ padding: 3, gap: 2 }}>
              <button type="button" aria-label="Grid view" className="seg__btn" data-on={view === "grid" ? "1" : "0"} onClick={() => setView("grid")}>Grid</button>
              <button type="button" aria-label="List view" className="seg__btn" data-on={view === "list" ? "1" : "0"} onClick={() => setView("list")}>List</button>
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
        <div className="mono-note" style={{ marginTop: 48 }}>Listing records read from redrocketrealty.com.au on 7 Oct 2026 · photos shown where the site publishes them · feature filters apply at feed level</div>
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
