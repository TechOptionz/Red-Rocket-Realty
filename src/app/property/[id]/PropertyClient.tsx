"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CONTACT, PAGES, agentByName, decorate, formatRent, isRental, isSoldListing, specs, telHref, type Listing } from "@/data/rr-data";
import { icsFile, icsFor, icsTimedEvent } from "@/lib/ics";
import { availableLabel, fmtDate, fmtDay, fmtRange, fmtRelDay, fmtTime, upcomingInspections } from "@/lib/listings/flags";
import Lines from "@/components/Lines";
import PropertyCard from "@/components/PropertyCard";
import Success from "@/components/Success";
import Photo, { loaderFor } from "@/components/Photo";
import { FLOORPLAN_DIMS } from "@/data/floorplan-dims";
import Lightbox from "@/components/Lightbox";
import FloorplanViewer from "@/components/FloorplanViewer";
import PropertyMap from "@/components/PropertyMap";
import ListingFlags from "@/components/ListingFlags";
import { useListings, useNow } from "@/components/ListingsProvider";

const STRIPE = "repeating-linear-gradient(135deg,rgba(255,255,255,.022) 0 12px,transparent 12px 24px)";
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const phone = (n?: string) => { const d = (n || "").replace(/\D/g, ""); return d.length === 10 && d.startsWith("04") ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)} ${d.slice(6)}` : n || ""; };
const yesNo = (v?: boolean) => (v === undefined ? null : v ? "Yes" : "No");

const ICON = {
  bed: <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 15h18M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M3 18v1M21 18v1" />,
  bath: <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2" />,
  car: <path d="M5 16h14M6 16v2M18 16v2M4 12l1.5-4.5A2 2 0 0 1 7.4 6h9.2a2 2 0 0 1 1.9 1.5L20 12v4H4v-4ZM7.5 13.5h.01M16.5 13.5h.01" />,
  land: <path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-5h6v5" />,
  plan: <path d="M4 4h16v16H4zM4 12h7M11 4v12M15 12h5" />,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  photos: <path d="M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01" />,
};
const Icon = ({ k, size = 18 }: { k: keyof typeof ICON; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON[k]}</svg>
);

/** YouTube id from youtu.be / watch?v= / embed / shorts links. */
const youtubeId = (url?: string | null) => (url ? /(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/.exec(url)?.[1] ?? null : null);

/**
 * Agent copy as LockedOn writes it: blank-line paragraphs, "•" bullet lines, and "Heading:" / short ALL-CAPS lines.
 * Rendered as real lists and sub-headings; collapsed after the first few blocks behind "Read more".
 */
function Description({ blocks, collapsedCount = 3 }: { blocks: string[]; collapsedCount?: number }) {
  const [open, setOpen] = useState(false);
  const isBullet = (l: string) => /^\s*[•·\-–*]\s*/.test(l);
  const isHeading = (l: string) => { const t = l.trim(); return t.length <= 60 && !isBullet(t) && (/:$/.test(t) || (t === t.toUpperCase() && /[A-Z]{3}/.test(t) && !/[.!?]$/.test(t))); };
  const render = (block: string, k: number) => {
    const out: React.ReactNode[] = [];
    let list: string[] = [], para: string[] = [];
    const flush = () => {
      if (para.length) { out.push(<p key={k + "p" + out.length} className="lead prop-desc__p">{para.join(" ")}</p>); para = []; }
      if (list.length) { out.push(<ul key={k + "u" + out.length} className="prop-desc__list">{list.map((li, i) => <li key={i}>{li}</li>)}</ul>); list = []; }
    };
    for (const line of block.split("\n").map((l) => l.trim()).filter(Boolean)) {
      if (isBullet(line)) { if (para.length) { const l = list; list = []; flush(); list = l; } list.push(line.replace(/^\s*[•·\-–*]\s*/, "")); }
      else if (isHeading(line)) { flush(); out.push(<h3 key={k + "h" + out.length} className="prop-desc__h">{line.replace(/:$/, "")}</h3>); }
      else { if (list.length) flush(); para.push(line); }
    }
    flush();
    return out;
  };
  // The whole description is always in the HTML (search engines and screen readers get all of it); only the view is clipped.
  const long = blocks.length > collapsedCount || blocks.join("").length > 900;
  return (
    <div className="prop-desc">
      <div id="prop-desc-body" className={"prop-desc__body" + (long && !open ? " prop-desc__body--clipped" : "")}>{blocks.map(render)}</div>
      {long ? <button type="button" className="prop-desc__more" aria-expanded={open} aria-controls="prop-desc-body" onClick={() => setOpen(!open)}>{open ? "Show less" : "Read more"} <span aria-hidden="true">{open ? "↑" : "↓"}</span></button> : null}
    </div>
  );
}

/** Click-to-load YouTube: a thumbnail until played, so the page doesn't pay for YouTube's ~1 MB of script up front. */
function Video({ url, title }: { url: string; title: string }) {
  const [on, setOn] = useState(false);
  const id = youtubeId(url);
  if (!id) return <a href={url} target="_blank" rel="noopener" className="pill pill--dark pill--md" style={{ justifySelf: "start" }}><Icon k="play" size={16} /> Watch the video</a>;
  return (
    <div className="prop-video">
      {on ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={"Video · " + title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      ) : (
        <button type="button" onClick={() => setOn(true)} aria-label={"Play video of " + title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
          <span className="prop-video__play"><Icon k="play" size={28} /></span>
        </button>
      )}
    </div>
  );
}

export default function PropertyClient({ p }: { p: Listing }) {
  const now = useNow();
  const idx = useListings();
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [shareLabel, setShareLabel] = useState("Share");
  const [lb, setLb] = useState<number | null>(null);
  const [fp, setFp] = useState<number | null>(null);

  const feed = !!p.mode;
  const isRent = isRental(p), isSold = isSoldListing(p), isLand = p.type === "Land", isSale = !isRent && !isSold;
  const mode = isRent ? "rent" : isSold ? "sold" : isLand ? "land" : "buy";
  const listLabel = isRent ? "For rent" : isSold ? "Recently sold" : isLand ? "Land for sale" : "For sale";
  const listHref = PAGES.listings + "?mode=" + mode;
  const suburbHref = listHref + "&suburb=" + encodeURIComponent(p.suburb);
  const priceText = feed ? p.price || "" : isRent ? formatRent(p.rent!) : isSold ? (p.price && /\d/.test(p.price) ? p.price : "Sold") : p.price || "";
  const placeLine = p.suburb + " " + (p.state || "QLD") + (p.postcode ? " " + p.postcode : "");

  // Listing agents: from the feed (matched to the team for headshot and title), else the static agent field.
  const toAgent = (n: string, ph?: string, em?: string) => {
    const t = agentByName(n);
    const mobile = phone(ph || t?.mobile);
    return { name: n, role: t?.role || "Sales", mobile, tel: telHref(mobile), email: em || t?.email || CONTACT.email, first: n.split(" ")[0], photo: t?.photo || "" };
  };
  const rentals = { name: "Red Rocket Realty Rentals", role: "Rentals and inspections", mobile: CONTACT.phone, tel: CONTACT.phoneHref, email: CONTACT.inspections, first: "Our rentals team", photo: "" };
  const agents = isRent ? [rentals]
    : p.agents?.length ? p.agents.slice(0, 2).map((a) => toAgent(a.name, a.phone, a.email))
    : p.agent ? [toAgent(p.agent)]
    : [toAgent("Parnam Singh Heir", "0434289285", "parnam@redrocketrealty.com.au")];
  const agent = agents[0];

  const photos = p.photos && p.photos.length ? p.photos : p.photo ? [p.photo] : [];
  const blurs = new Map((p.images || []).map((i) => [i.url, i.blur]));
  const thumbs = photos.slice(1, 5);
  const dec = decorate(p);
  const floorplans = feed
    ? (p.floorplanImages || []).map((f) => ({ src: f.url, w: f.w || 2000, h: f.h || 1400 }))
    : (p.floorplans || []).map((src) => ({ src, w: (FLOORPLAN_DIMS[src] || [1600, 1200])[0], h: (FLOORPLAN_DIMS[src] || [1600, 1200])[1] }));

  // Inspections: real times from the feed (upcoming only); the static data has one display string.
  const inspections = feed
    ? upcomingInspections(p, now).map((i, k) => ({ key: i.start, day: fmtRelDay(i.start, now) === fmtDay(i.start) ? fmtDay(i.start) : fmtRelDay(i.start, now) + " · " + fmtDay(i.start), time: fmtRange(i.start, i.end), ics: icsFile([icsTimedEvent(p, i.start, i.end, "Inspection", now)]), file: `inspection-${p.listingId}-${k + 1}.ics`, live: Date.parse(i.start) <= now }))
    : p.inspection ? [{ key: p.inspection, day: p.inspection.split(" · ")[0], time: p.inspection.split(" · ")[1] || "", ics: icsFor(p, p.inspection), file: "inspection-" + p.id + ".ics", live: false }] : [];
  const allIcs = feed && inspections.length > 1 ? icsFile(upcomingInspections(p, now).map((i) => icsTimedEvent(p, i.start, i.end, "Inspection", now))) : null;
  const auction = feed && p.auctionAt && Date.parse(p.auctionAt) > now ? { when: fmtRelDay(p.auctionAt, now) + " " + fmtTime(p.auctionAt), date: fmtDate(p.auctionAt), ics: icsFile([icsTimedEvent(p, p.auctionAt, new Date(Date.parse(p.auctionAt) + 3600_000).toISOString(), "Auction", now)]) } : null;
  const available = isRent ? availableLabel(p, now) : null;

  const parking = [p.garages ? p.garages + " garage" : "", p.carports ? p.carports + " carport" : ""].filter(Boolean).join(" · ");
  const details = ([
    ["Property type", p.type || "Land"],
    !isLand ? ["Bedrooms", p.beds || "—"] : null,
    !isLand ? ["Bathrooms", (p.baths || "—") + (p.ensuites ? ` (incl. ${p.ensuites} ensuite${p.ensuites > 1 ? "s" : ""})` : "")] : null,
    p.toilets ? ["Separate toilets", p.toilets] : null,
    !isLand ? ["Parking", parking || (p.cars ? p.cars + " car" : "—")] : null,
    ["Land size", p.land || "—"],
    p.buildingArea ? ["Building size", p.buildingArea] : null,
    isRent && available ? ["Available", available.replace(/^Available /, "")] : null,
    isRent && p.bond ? ["Bond", money(p.bond)] : null,
    isRent && yesNo(p.allowances?.pets) ? ["Pets considered", yesNo(p.allowances?.pets)] : null,
    isRent && yesNo(p.allowances?.furnished) ? ["Furnished", yesNo(p.allowances?.furnished)] : null,
    isSold && p.soldDate ? ["Sold on", fmtDate(p.soldDate + "T00:00:00+10:00")] : null,
    isSold ? ["Sold price", /\d/.test(priceText) ? priceText.replace(/^Sold /, "") : "Price withheld"] : null,
    ["Listing ID", p.listingId ? p.listingId.slice(0, 8).toUpperCase() : "RR-" + String(p.id).toUpperCase()],
  ].filter(Boolean) as [string, string | number][]);
  const features = p.features?.length ? p.features : feed ? [] : isLand ? ["Flat block", "Services available", "Freehold title"] : ["Air conditioning", "Built-in robes", "Dishwasher", "Covered deck", "Courtyard", "Garden shed", "Secure parking", p.type || "House"];
  const headline = p.headline || (isLand ? "Build on " + p.address + ", " + p.suburb : isRent ? (p.type || "Home") + " for rent in " + p.suburb : (p.beds ? p.beds + " bedroom " : "") + (p.type || "home").toLowerCase() + " in " + p.suburb);
  const blocks = p.desc?.length ? p.desc : [isLand ? "A level, ready-to-build block in an established street, close to schools, shops and transport. Lot dimensions and title details are available from the agent." : "A well-presented home with a practical layout, generous outdoor areas and secure parking, set in a quiet, established street close to schools, shops and transport."];

  // Similar: same search, same suburb first.
  const pool = isRent ? idx.RENT : isSold ? idx.SOLD : isLand ? idx.LAND : [...idx.SALE, ...idx.LAND];
  const similar = pool.filter((x) => x.id !== p.id).sort((a, b) => Number(b.suburb === p.suburb) - Number(a.suburb === p.suburb)).slice(0, 4);
  const hasMap = !!p.map && p.map !== "none";
  const brochureHref = p.brochure ? "https://redrocketrealty.com.au?epl_br_action=generate&id=" + p.brochure : null;
  const specIcons = isLand ? [{ k: "land" as const, v: p.land, l: "land" }] : [{ k: "bed" as const, v: p.beds, l: p.beds === 1 ? "bed" : "beds" }, { k: "bath" as const, v: p.baths, l: p.baths === 1 ? "bath" : "baths" }, { k: "car" as const, v: p.cars, l: p.cars === 1 ? "car" : "cars" }, ...(p.land ? [{ k: "land" as const, v: p.land, l: "" }] : [])];

  const share = () => {
    const url = window.location.href;
    const done = () => { setShareLabel("Link copied"); setTimeout(() => setShareLabel("Share"), 1800); };
    if (navigator.share) navigator.share({ title: p.address + ", " + p.suburb, url }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done);
    else done();
  };

  return (
    <main>
      <section className="section--bg" style={{ padding: "130px var(--pad-x) 0" }}>
        <nav aria-label="Breadcrumb" className="crumb" style={{ marginBottom: 24 }}>
          <Link href={PAGES.home}>Home</Link><span aria-hidden="true">/</span><Link href={listHref}>{listLabel}</Link><span aria-hidden="true">/</span><Link href={suburbHref}>{p.suburb}</Link><span aria-hidden="true">/</span><span>{p.address}</span>
        </nav>
        {photos.length ? (
          <div className={"gallery" + (thumbs.length === 0 ? " gallery--solo" : thumbs.length < 3 ? " gallery--col" : thumbs.length === 3 ? " gallery--three" : "")} style={thumbs.length > 0 && thumbs.length < 3 ? { ["--thumb-rows" as string]: thumbs.length } : undefined}>
            <button type="button" data-reveal="clip" onClick={() => setLb(0)} aria-label={"Open photo 1 of " + photos.length} className="gallery__main">
              <div data-zoom className="card__img" style={{ backgroundColor: p.shade, padding: 0 }}><Photo src={photos[0]} blur={blurs.get(photos[0])} alt={p.address + ", " + p.suburb} sizes={thumbs.length ? "(max-width: 980px) 100vw, 60vw" : "100vw"} priority quality={85} /></div>
              {!feed && p.status ? <span className={"tag" + (isSold ? " tag--sold" : "")} style={{ padding: "10px 14px", letterSpacing: ".14em" }}>{p.status}</span> : null}
              {photos.length > 1 ? <span className="gallery__all"><Icon k="photos" size={16} />Show all {photos.length} photos</span> : null}
            </button>
            {thumbs.length ? (
              <div className="gallery__thumbs">
                {thumbs.map((src, k) => {
                  const i = k + 1, isLast = k === thumbs.length - 1, extra = photos.length - 1 - thumbs.length;
                  return (
                    <button key={src} type="button" onClick={() => setLb(i)} aria-label={"Open photo " + (i + 1) + " of " + photos.length} className="gallery__thumb">
                      <div data-zoom><Photo src={src} blur={blurs.get(src)} sizes="(max-width: 980px) 25vw, 20vw" quality={75} /></div>
                      {isLast && extra > 0 ? <div className="gallery__more"><b>+{extra}</b><span>View all photos</span></div> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="gallery">
            <div data-reveal="clip" className="gallery__main">
              <div className="card__img" style={{ backgroundColor: p.shade, backgroundImage: dec.bgImage, padding: 24 }}>{dec.imgTag ? (<><span>{dec.imgTag}</span><br /><span>{dec.img}</span></>) : null}</div>
              {p.status ? <span className={"tag" + (isSold ? " tag--sold" : "")} style={{ padding: "10px 14px", letterSpacing: ".14em" }}>{p.status}</span> : null}
            </div>
            <div className="gallery__thumbs">
              {["Kitchen", "Living", "Bedroom", "Outdoor"].map((label) => (
                <div key={label} className="gallery__thumb gallery__thumb--empty"><div style={{ backgroundImage: STRIPE }}>{label}</div></div>
              ))}
            </div>
          </div>
        )}
        {(floorplans.length || p.videoUrl || p.tourUrl) ? (
          <div className="media-bar">
            {photos.length > 1 ? <button type="button" className="pill pill--ghost pill--sm" onClick={() => setLb(0)}><Icon k="photos" size={16} /> {photos.length} photos</button> : null}
            {floorplans.length ? <button type="button" className="pill pill--ghost pill--sm" onClick={() => setFp(0)}><Icon k="plan" size={16} /> Floor plan</button> : null}
            {p.videoUrl ? <a href="#video" className="pill pill--ghost pill--sm"><Icon k="play" size={16} /> Video</a> : null}
            {p.tourUrl ? <a href={p.tourUrl} target="_blank" rel="noopener" className="pill pill--ghost pill--sm">3D tour ↗</a> : null}
          </div>
        ) : null}
        {fp !== null && floorplans.length ? <FloorplanViewer plans={floorplans} index={fp} title={p.address} subtitle={placeLine} onClose={() => setFp(null)} onIndex={setFp} /> : null}
        {lb !== null && photos.length ? <Lightbox photos={photos} index={lb} title={p.address} subtitle={placeLine} onClose={() => setLb(null)} onIndex={setLb} /> : null}
        <div className="prop-head">
          <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
            {feed ? <ListingFlags p={p} variant="inline" /> : null}
            <Lines as="h1" className="display-lg" style={{ fontSize: "clamp(2rem,1.2rem + 3vw,4rem)", lineHeight: 1 }} lines={[p.address]} />
            <div style={{ fontSize: 16, color: "var(--grey)", fontWeight: 500 }}>{placeLine} · {p.type || "Land"}</div>
            {feed ? (
              <div className="prop-icons">
                {specIcons.map((s) => (<span key={s.k}><Icon k={s.k} /><b>{s.v}</b>{s.l ? <span>{s.l}</span> : null}</span>))}
              </div>
            ) : (
              <div className="prop-specs">
                {specs(p).map((s) => (<span key={s} style={{ display: "inline-flex", alignItems: "center" }}><span>{s}</span><i aria-hidden="true">●</i></span>))}
                <span style={{ color: "var(--grey)" }}>ID {p.listingId ? p.listingId.slice(0, 8).toUpperCase() : "RR-" + String(p.id).toUpperCase()}</span>
              </div>
            )}
          </div>
          <div style={{ display: "grid", gap: 16, justifyItems: "end", flex: "none" }}>
            <div style={{ display: "grid", gap: 6, justifyItems: "inherit" }}>
              <div className="prop-price">{isSold && feed ? (/\d/.test(priceText) ? priceText.replace(/^Sold /, "") : "Price withheld") : priceText}</div>
              {isRent && p.bond ? <div className="prop-price__sub">Bond {money(p.bond)}</div> : null}
              {isSold && feed && p.soldDate ? <div className="prop-price__sub">Sold on {fmtDate(p.soldDate + "T00:00:00+10:00")}</div> : null}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
              {floorplans.length ? <button type="button" className="pill pill--ghost pill--sm" onClick={() => setFp(0)}>Floor plan</button> : null}
              {brochureHref ? <a href={brochureHref} target="_blank" rel="noopener" className="pill pill--ghost pill--sm">Brochure</a> : null}
              <button type="button" onClick={share} className="pill pill--ghost pill--sm">{shareLabel}</button>
            </div>
          </div>
        </div>
        <div className="subnav">
          <nav aria-label="On this page">
            <a href="#overview">Overview</a>
            {features.length ? <a href="#features">Features</a> : null}
            {!isSold ? <a href="#inspections">{auction ? "Auction & inspections" : "Inspections"}</a> : null}
            {floorplans.length ? <a href="#floorplan">Floor plan</a> : null}
            {p.videoUrl ? <a href="#video">Video</a> : null}
            <a href="#location">Location</a>
          </nav>
          <div style={{ display: "flex", gap: 8 }}>
            {isSale ? <Link href={PAGES.guides + "?guide=buyer#offer"} className="pill pill--ghost pill--sm hide-m">Make an offer</Link> : null}
            <a href="#enquire" className="pill pill--red pill--sm" style={{ padding: "0 20px" }}>{isSold ? "Ask about this sale" : "Enquire now"}</a>
          </div>
        </div>
      </section>

      <section className="section--white" style={{ padding: "clamp(48px,6vw,80px) var(--pad-x) var(--sec-y)" }}>
        <div className="prop-cols">
          <div style={{ display: "grid", gap: "clamp(48px,6vw,80px)", minWidth: 0 }}>
            <div id="overview" className="prop-block" style={{ gap: 20 }}>
              <Lines className="h3" style={{ fontSize: "clamp(1.6rem,1.1rem + 1.8vw,2.6rem)", letterSpacing: "-.025em", lineHeight: 1.08, textWrap: "balance" }} lines={[headline]} />
              <Description blocks={blocks} collapsedCount={feed ? 3 : 5} />
            </div>
            <div data-reveal className="rows">
              <div className="kicker" style={{ marginBottom: 16 }}>Property details</div>
              {details.map(([k, v]) => (<div key={k} className="row row--wide"><span className="row__k">{k}</span><span className="row__v">{String(v)}</span></div>))}
            </div>
            {features.length ? (
              <div id="features" data-reveal className="prop-block">
                <div className="kicker">Property features</div>
                <div className="features">{features.map((f) => (<div key={f} className="feature"><span aria-hidden="true" />{f}</div>))}</div>
              </div>
            ) : null}
            {!isSold ? (
              <div id="inspections" data-reveal className="prop-block">
                {auction ? (
                  <div className="auction">
                    <div style={{ display: "grid", gap: 4 }}><div className="kicker kicker--light">Auction</div><div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.01em" }}>{auction.when}</div><div style={{ fontSize: 14, color: "var(--grey-light)" }}>{auction.date} · On site unless advised</div></div>
                    <a href={auction.ics} download={`auction-${p.listingId}.ics`} className="pill pill--white pill--sm">Add to calendar ↓</a>
                  </div>
                ) : null}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div className="kicker">Inspection times</div>
                  {allIcs ? <a href={allIcs} download={`inspections-${p.listingId}.ics`} className="text-link" style={{ fontSize: 13 }}>Add all to calendar ↓</a> : null}
                </div>
                {inspections.length ? (
                  <div style={{ display: "grid" }}>
                    {inspections.map((i) => (
                      <div key={i.key} className="insp">
                        <div style={{ display: "grid", gap: 2 }}>
                          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>{i.day}{i.live ? <span className="insp__live">Open now</span> : null}</span>
                          <span style={{ fontSize: 14, color: "var(--grey)" }}>{i.time}</span>
                        </div>
                        <a href={i.ics} download={i.file} className="pill pill--ghost pill--sm">Add to calendar <span aria-hidden="true">↓</span></a>
                      </div>
                    ))}
                    <div className="rule" />
                  </div>
                ) : (
                  <div style={{ padding: "18px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", fontSize: 15, color: "var(--grey-2)" }}>
                    {isRent ? "No inspections scheduled yet. Register your interest and the rentals team will let you know when one is booked." : "No open homes scheduled. Contact the agent to arrange a private inspection."}
                  </div>
                )}
                <p className="small">{isRent ? "Rental inspections are run by the rentals team on " : "After-hours viewings are available by appointment through the team on "}<a href={CONTACT.phoneHref} style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "none" }}>{CONTACT.phone}</a>.</p>
              </div>
            ) : null}
            {floorplans.length || !feed ? (
              <div id="floorplan" data-reveal className="prop-block">
                <div className="kicker">Floor plan</div>
                {floorplans.length ? (
                  <div style={{ display: "grid", gap: 16 }}>
                    {floorplans.map((f, i) => (
                      <button key={f.src} type="button" onClick={() => setFp(i)} className="floorplan" aria-label={"View floor plan " + (floorplans.length > 1 ? i + 1 + " " : "") + "full screen"}>
                        <Image loader={loaderFor(f.src)} src={f.src} alt={"Floor plan " + (floorplans.length > 1 ? i + 1 : "") + " for " + p.address + ", " + p.suburb} width={f.w} height={f.h} sizes="(max-width: 980px) 100vw, 60vw" quality={85} style={{ width: "100%", height: "auto" }} />
                      </button>
                    ))}
                    <p className="small">Click the plan to view it full screen and zoom in.</p>
                  </div>
                ) : (
                  <div style={{ padding: "18px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", fontSize: 15, color: "var(--grey-2)" }}>No floor plan has been supplied for this property. Download the brochure or contact the agent for layout details.</div>
                )}
              </div>
            ) : null}
            {p.videoUrl ? (
              <div id="video" data-reveal className="prop-block">
                <div className="kicker">Video</div>
                <Video url={p.videoUrl} title={p.address + ", " + p.suburb} />
              </div>
            ) : null}
            <div id="location" data-reveal className="prop-block">
              <div className="kicker">Location</div>
              {hasMap ? <PropertyMap p={p} /> : <p style={{ margin: 0, fontSize: 15, color: "var(--grey-2)" }}>{p.address}, {placeLine}</p>}
              <Link href={suburbHref} className="text-link">More properties in {p.suburb} <span data-arrow className="text-link__ring" aria-hidden="true">→</span></Link>
            </div>
            {isSale && !p.underOffer && (
              <div data-reveal className="eoi">
                <div style={{ display: "grid", gap: 6 }}><div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.01em" }}>Interested? Submit an expression of interest.</div><div className="small">A written offer with price, deposit, finance and settlement terms, signed online.</div></div>
                <Link href={PAGES.guides + "?guide=buyer#offer"} className="pill pill--dark pill--md">Make an offer</Link>
              </div>
            )}
            {isSold && (
              <div data-reveal className="eoi">
                <div style={{ display: "grid", gap: 6 }}><div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.01em" }}>Thinking of selling in {p.suburb}?</div><div className="small">Get a free appraisal backed by recent sales like this one.</div></div>
                <Link href={PAGES.appraisal} className="pill pill--dark pill--md">Request an appraisal</Link>
              </div>
            )}
          </div>

          <aside id="enquire" className="enquire">
            <div className="enquire__card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "grid", gap: 4 }}><div className="kicker kicker--light" style={{ letterSpacing: ".14em" }}>{isRent ? (/month/i.test(p.rentPeriod || "") ? "Monthly rent" : "Weekly rent") : isSold ? (/\d/.test(priceText) ? "Sold price" : "Status") : "Price"}</div><div style={{ fontSize: "clamp(1.3rem,1.15rem + .5vw,1.55rem)", fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.05 }}>{isSold && feed ? (/\d/.test(priceText) ? priceText.replace(/^Sold /, "") : "Sold") : priceText}</div></div>
                {inspections.length > 0 ? (<div style={{ textAlign: "right", display: "grid", gap: 2 }}><div className="kicker kicker--light" style={{ letterSpacing: ".14em" }}>{isRent ? "Next inspection" : "Next open home"}</div><div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>{inspections[0].day.replace(/ · .*/, "")} · {inspections[0].time}</div></div>)
                  : available ? (<div style={{ textAlign: "right", display: "grid", gap: 2 }}><div className="kicker kicker--light" style={{ letterSpacing: ".14em" }}>Availability</div><div style={{ fontSize: 14, fontWeight: 700 }}>{available}</div></div>) : null}
              </div>
              <div className="enquire__agents">
                {agents.map((a) => (
                  <div key={a.name} className="enquire__agent">
                    <div className="enquire__face" style={{ position: "relative" }}>{a.photo ? <Photo src={a.photo} sizes="52px" position="center top" /> : a.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
                    <div className="enquire__who"><b>{a.name}</b><span>{a.role}</span></div>
                    {a.mobile ? (
                      <a href={a.tel} className="enquire__call" aria-label={"Call " + a.name + " on " + a.mobile}>
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>
                        {a.mobile}
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
              {!sent ? (
                <form className="enquire__form" onSubmit={(e) => { e.preventDefault(); setName(String(new FormData(e.currentTarget).get("name") || "").split(" ")[0]); setSent(true); }}>
                  <label className="field field--dark">Full name<input name="name" required autoComplete="name" className="input input--dark" /></label>
                  <div className="enquire__row">
                    <label className="field field--dark">Email<input name="email" type="email" required autoComplete="email" className="input input--dark" /></label>
                    <label className="field field--dark"><span>Phone <span className="opt">(optional)</span></span><input name="phone" type="tel" autoComplete="tel" className="input input--dark" /></label>
                  </div>
                  <label className="field field--dark">Message<textarea name="comments" required rows={2} placeholder={"I’d like to know more about " + p.address + "."} className="input input--dark" /></label>
                  <input type="hidden" name="property" value={p.address} />
                  <input type="hidden" name="listingId" value={p.listingId || p.id} />
                  <button type="submit" className="pill pill--red" style={{ justifyContent: "center" }}>{"Email " + (isRent ? "the rentals team" : agent.first)}</button>
                  <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--grey-3)" }}>By sending you agree to our <a href="https://redrocketrealty.com.au/privacy-policy/" target="_blank" rel="noopener" style={{ color: "var(--grey-light)", fontWeight: 700 }}>Privacy Policy</a>.</div>
                </form>
              ) : (
                <Success title="Enquiry sent." light onReset={() => setSent(false)}>Thanks, {name}. {agent.first} will be in touch about {p.address}.</Success>
              )}
            </div>
            <Link href={suburbHref + "#alerts"} className="enquire__alert"><span>Get alerts for new listings in {p.suburb}</span><span aria-hidden="true" style={{ color: "var(--brand-red)" }}>→</span></Link>
          </aside>
        </div>
      </section>

      {similar.length ? (
        <section className="section--bg" style={{ padding: "var(--sec-y) 0", overflow: "hidden" }}>
          <div className="sec-head px">
            <div className="sec-head__text"><div className="kicker">{isSold ? "Recent sales" : "Similar properties"}</div><Lines className="h2" lines={[isSold ? "More sold nearby." : "More to explore nearby."]} /></div>
            <Link href={listHref} className="pill pill--dark" style={{ flex: "none" }}>All {listLabel.toLowerCase()}</Link>
          </div>
          <div className="strip">
            {similar.map((x) => <PropertyCard key={x.id} p={x} width="min(420px,84vw)" />)}
            <div className="strip-end" aria-hidden="true" />
          </div>
        </section>
      ) : null}

      {/* Phones: the enquiry card is far down the page, so keep call / enquire one tap away. */}
      <div className="prop-cta" role="region" aria-label="Contact the agent">
        <div style={{ minWidth: 0 }}><div className="prop-cta__price">{isSold && feed ? (/\d/.test(priceText) ? priceText.replace(/^Sold /, "") : "Sold") : priceText}</div><div className="prop-cta__sub">{agent.name}</div></div>
        <a href={agent.tel} className="pill pill--ghost pill--sm">Call</a>
        <a href="#enquire" className="pill pill--red pill--sm">Enquire</a>
      </div>
    </main>
  );
}
