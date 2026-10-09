"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PAGES, PHOTOS, SEARCH } from "@/data/rr-data";
import Photo from "@/components/Photo";

type Mode = "buy" | "rent" | "sell";

export default function Hero({ onAppraise }: { onAppraise: (address: string) => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("buy");
  const [suburb, setSuburb] = useState("");
  const [ptype, setPtype] = useState("");
  const [pfrom, setPfrom] = useState("");
  const [pto, setPto] = useState("");
  const [beds, setBeds] = useState("");
  const bg = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      const y = window.scrollY || 0;
      if (bg.current && y < vh * 1.2) bg.current.style.transform = "translate3d(0," + (y * 0.28).toFixed(1) + "px,0) scale(" + (1 + (Math.min(y, vh) / vh) * 0.04).toFixed(3) + ")";
      if (content.current && y < vh * 1.2 && window.innerWidth > 720) {
        const p = Math.min(1, y / (vh * 0.6));
        content.current.style.transform = "translate3d(0," + (-p * vh * 0.12).toFixed(1) + "px,0)";
        content.current.style.opacity = (1 - p).toFixed(3);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const isRent = mode === "rent";
  const switchMode = (m: Mode) => {
    setMode(m);
    if (m !== "sell") { setSuburb(""); setPtype(""); setPfrom(""); setPto(""); }
  };
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams({ mode });
    if (suburb) q.set("suburb", suburb);
    if (ptype) q.set("type", ptype);
    if (pfrom) q.set("from", pfrom);
    if (pto) q.set("to", pto);
    if (beds) q.set("beds", beds);
    router.push(PAGES.listings + "?" + q.toString());
  };
  const submitAppraise = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const addr = String(new FormData(e.currentTarget).get("address") || "");
    onAppraise(addr);
    const t = document.getElementById("appraisal");
    if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
  };
  const suburbs = isRent ? SEARCH.rentSuburbs : SEARCH.buySuburbs;
  const types = isRent ? SEARCH.rentTypes : SEARCH.buyTypes;
  const prices = isRent ? SEARCH.rentPrices : SEARCH.buyPrices;

  return (
    <section className="hero">
      <div ref={bg} className="hero__bg" aria-hidden="true"><Photo src={PHOTOS.pool} sizes="100vw" priority quality={75} /></div>
      <div className="hero__shade" aria-hidden="true" />
      <div ref={content} className="hero__content">
        <div style={{ display: "grid", gap: 22, maxWidth: 1100 }}>
          <div className="hero__kick"><span aria-hidden="true" />Springwood · Logan City and surrounding areas</div>
          <h1 className="display-xl">
            <span><span>Dedicated to results</span></span>
            <span><span>that are <span style={{ color: "var(--brand-red)", display: "inline" }}>out of this world.</span></span></span>
          </h1>
          <p className="hero__lead">The local experts Logan can rely on and trust. Buying, selling and renting across Logan for over 25 years.</p>
        </div>
        <div className="hero__search">
          <div role="tablist" aria-label="Search mode" className="seg seg--glass">
            <button type="button" role="tab" className="seg__btn" data-on={mode === "buy" ? "1" : "0"} onClick={() => switchMode("buy")}>Buy</button>
            <button type="button" role="tab" className="seg__btn" data-on={mode === "rent" ? "1" : "0"} onClick={() => switchMode("rent")}>Rent</button>
            <button type="button" role="tab" className="seg__btn" data-on={mode === "sell" ? "1" : "0"} onClick={() => switchMode("sell")}>Sell · What&apos;s my home worth?</button>
          </div>
          {mode === "sell" ? (
            <form onSubmit={submitAppraise} className="hero__appraise">
              <label htmlFor="hero-addr" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Property address</label>
              <input id="hero-addr" name="address" required placeholder="Enter your property address" autoComplete="street-address" />
              <button type="submit">What&apos;s my home worth?</button>
            </form>
          ) : (
            <form onSubmit={submitSearch} className="search-bar">
              <label className="search-field" style={{ flexBasis: 170 }}>
                <span>Suburb</span>
                <select value={suburb} onChange={(e) => setSuburb(e.target.value)}>
                  <option value="">Any suburb</option>
                  {suburbs.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label className="search-field">
                <span>Property type</span>
                <select value={ptype} onChange={(e) => setPtype(e.target.value)}>
                  <option value="">Any type</option>
                  {types.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label className="search-field" style={{ flexBasis: 130 }}>
                <span>{isRent ? "Rent from" : "Price from"}</span>
                <select value={pfrom} onChange={(e) => setPfrom(e.target.value)}>
                  <option value="">Any</option>
                  {prices.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
                </select>
              </label>
              <label className="search-field" style={{ flexBasis: 130 }}>
                <span>Price to</span>
                <select value={pto} onChange={(e) => setPto(e.target.value)}>
                  <option value="">Any</option>
                  {prices.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
                </select>
              </label>
              <label className="search-field" style={{ flexBasis: 120 }}>
                <span>Bedrooms</span>
                <select value={beds} onChange={(e) => setBeds(e.target.value)}>
                  <option value="">Any</option>
                  {["1", "2", "3", "4", "5"].map((b) => <option key={b} value={b}>{b}+</option>)}
                </select>
              </label>
              <button data-mag type="submit" aria-label="Search properties" className="search-go">→</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
