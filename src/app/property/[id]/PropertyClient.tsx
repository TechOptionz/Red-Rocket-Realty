"use client";
import { useState } from "react";
import Link from "next/link";
import { CONTACT, LAND, PAGES, RENT, SALE, SOLD, agentByName, decorate, formatRent, propHref, specs, type Listing } from "@/data/rr-data";
import { icsFor } from "@/lib/ics";
import Lines from "@/components/Lines";
import PropertyCard from "@/components/PropertyCard";
import Success from "@/components/Success";
import Image from "next/image";
import Photo from "@/components/Photo";
import { FLOORPLAN_DIMS } from "@/data/floorplan-dims";
import Lightbox from "@/components/Lightbox";
import PropertyMap from "@/components/PropertyMap";

const STRIPE = "repeating-linear-gradient(135deg,rgba(255,255,255,.022) 0 12px,transparent 12px 24px)";

export default function PropertyClient({ p }: { p: Listing }) {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [shareLabel, setShareLabel] = useState("Share");
  const [lb, setLb] = useState<number | null>(null);

  const isRent = !!p.rent, isSold = p.status === "Sold", isLand = p.type === "Land", isSale = !isRent && !isSold;
  const mode = isRent ? "rent" : isSold ? "sold" : isLand ? "land" : "buy";
  const listLabel = isRent ? "For rent" : isSold ? "Recently sold" : isLand ? "Land for sale" : "For sale";
  const listHref = PAGES.listings + "?mode=" + mode;
  const suburbHref = listHref + "&suburb=" + encodeURIComponent(p.suburb);
  const priceText = isRent ? formatRent(p.rent!) : isSold ? (p.price && /\d/.test(p.price) ? p.price : "Sold") : p.price;
  const ag = p.agent ? agentByName(p.agent) : undefined;
  const agent = isRent
    ? { name: "Red Rocket Realty Rentals", role: "Rentals and inspections", mobile: CONTACT.phone, tel: CONTACT.phoneHref, email: CONTACT.inspections, first: "Our rentals team", photo: "" }
    : ag
      ? { name: ag.name, role: ag.role, mobile: ag.mobile, tel: "tel:+61" + ag.mobile.replace(/\D/g, "").slice(1), email: ag.email, first: ag.name.split(" ")[0], photo: ag.photo }
      : { name: "Parnam Singh Heir", role: "Principal / Director", mobile: "0434 289 285", tel: "tel:+61434289285", email: "parnam@redrocketrealty.com.au", first: "Parnam", photo: "" };
  const photos = p.photos && p.photos.length ? p.photos : p.photo ? [p.photo] : [];
  const thumbs = photos.slice(1, 5);
  const dec = decorate(p);
  const inspections = p.inspection ? [{ day: p.inspection.split(" · ")[0], time: p.inspection.split(" · ")[1] || "", ics: icsFor(p, p.inspection), file: "inspection-" + p.id + ".ics" }] : [];
  if (p.inspection && isSale) inspections.push({ day: "Wed 15 Oct", time: "5:00–5:30pm", ics: icsFor(p, "Wed 15 Oct · 5:00–5:30pm"), file: "inspection-" + p.id + "-2.ics" });
  const details = ([["Property type", p.type || "Land"], ["Bedrooms", p.beds || "—"], ["Bathrooms", p.baths || "—"], ["Parking", p.cars ? p.cars + " car" : "—"], ["Land size", p.land || "From feed"], isRent ? ["Available", p.available || ""] : null, ["Listing ID", "RR-" + String(p.id).toUpperCase() + "-SAMPLE"]].filter(Boolean) as [string, string | number][]);
  const features = p.features || (isLand ? ["Flat block", "Services available", "Title from feed"] : ["Air conditioning", "Built-in robes", "Dishwasher", "Covered deck", "Courtyard", "Garden shed", "Secure parking", p.type || "House"]);
  const headline = p.headline || (isLand ? "Build on " + p.address + ", " + p.suburb : isRent ? (p.type || "Home") + " for rent in " + p.suburb : (p.beds ? p.beds + " bedroom " : "") + (p.type || "home").toLowerCase() + " in " + p.suburb);
  const desc1 = p.desc ? p.desc[0] : isLand ? "Lot details, dimensions and title information are supplied by the listing feed. This placeholder shows the position and length of the description block." : "Listing description from the feed. This sample copy stands in for the agent-written description: layout, outdoor areas, parking and the street setting, written in the agency’s voice.";
  const desc2 = p.desc ? p.desc.slice(1).join(" ") : isRent ? "Available " + (p.available || "soon").replace("Available ", "").toLowerCase() + ". Applications via the Queensland RTA Form 22 (download), returned to the office. Inspection times are listed below and can be saved to your calendar." : "Inspection times, floor plan and brochure are listed below. Interested buyers can submit an expression of interest online with price, deposit, finance and settlement terms.";
  const sourceNote = p.desc ? "Listing copy, features, ID, inspection and agent read from redrocketrealty.com.au on 7 Oct 2026" : "Sample listing · headline, description, features, ID and inspections come from the feed";
  const all = [...SALE, ...LAND, ...SOLD, ...RENT];
  const similar = all.filter((x) => x.id !== p.id && (isRent ? !!x.rent : !x.rent && x.status !== "Sold")).slice(0, 4);
  const hasMap = !!p.map && p.map !== "none";
  const brochureHref = p.brochure ? "https://redrocketrealty.com.au?epl_br_action=generate&id=" + p.brochure : "#overview";

  const share = () => {
    const url = window.location.href;
    const done = () => { setShareLabel("Link copied"); setTimeout(() => setShareLabel("Share"), 1800); };
    if (navigator.share) navigator.share({ title: p.address + ", " + p.suburb, url }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done);
    else done();
  };

  return (
    <main>
      <section className="section--dark" style={{ padding: "130px var(--pad-x) 0" }}>
        <nav aria-label="Breadcrumb" className="crumb crumb--dim" style={{ marginBottom: 24 }}>
          <Link href={PAGES.home}>Home</Link><span aria-hidden="true">/</span><Link href={listHref}>{listLabel}</Link><span aria-hidden="true">/</span><Link href={suburbHref}>{p.suburb}</Link><span aria-hidden="true">/</span><span>{p.address}</span>
        </nav>
        {photos.length ? (
          <div className={"gallery" + (thumbs.length === 0 ? " gallery--solo" : thumbs.length < 3 ? " gallery--col" : thumbs.length === 3 ? " gallery--three" : "")} style={thumbs.length > 0 && thumbs.length < 3 ? { ["--thumb-rows" as string]: thumbs.length } : undefined}>
            <button type="button" data-reveal="clip" onClick={() => setLb(0)} aria-label={"Open photo 1 of " + photos.length} className="gallery__main">
              <div data-zoom className="card__img" style={{ backgroundColor: p.shade, padding: 0 }}><Photo src={photos[0]} alt={p.address + ", " + p.suburb} sizes={thumbs.length ? "(max-width: 980px) 100vw, 60vw" : "100vw"} priority quality={85} /></div>
              {p.status ? <span className={"tag" + (isSold ? " tag--sold" : "")} style={{ padding: "10px 14px", letterSpacing: ".14em" }}>{p.status}</span> : null}
              {photos.length > 1 ? <span className="gallery__all"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01" /></svg>Show all {photos.length} photos</span> : null}
            </button>
            {thumbs.length ? (
              <div className="gallery__thumbs">
                {thumbs.map((src, k) => {
                  const idx = k + 1, isLast = k === thumbs.length - 1, extra = photos.length - 1 - thumbs.length;
                  return (
                    <button key={src} type="button" onClick={() => setLb(idx)} aria-label={"Open photo " + (idx + 1) + " of " + photos.length} className="gallery__thumb">
                      <div data-zoom><Photo src={src} sizes="(max-width: 980px) 25vw, 20vw" quality={75} /></div>
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
        {lb !== null && photos.length ? <Lightbox photos={photos} index={lb} title={p.address} subtitle={p.suburb + " QLD" + (p.postcode ? " " + p.postcode : "")} onClose={() => setLb(null)} onIndex={setLb} /> : null}
        <div className="prop-head">
          <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
            <Lines as="h1" className="display-lg" style={{ fontSize: "clamp(2rem,1.2rem + 3vw,4rem)", lineHeight: 1 }} lines={[p.address]} />
            <div style={{ fontSize: 16, color: "var(--grey-light)", fontWeight: 500 }}>{p.suburb} QLD · {p.type || "Land"}</div>
            <div className="prop-specs">
              {specs(p).map((s) => (<span key={s} style={{ display: "inline-flex", alignItems: "center" }}><span>{s}</span><i aria-hidden="true">●</i></span>))}
              <span style={{ color: "var(--grey-light)" }}>ID {p.listingId ? p.listingId.slice(0, 8).toUpperCase() : "RR-" + String(p.id).toUpperCase()}</span>
            </div>
          </div>
          <div style={{ display: "grid", gap: 16, justifyItems: "end", flex: "none" }}>
            <div className="prop-price">{priceText}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
              <a href="#floorplan" className="pill pill--ghost-light pill--sm">Floor plan</a>
              <a href={brochureHref} target="_blank" rel="noopener" className="pill pill--ghost-light pill--sm">Brochure</a>
              <button type="button" onClick={share} className="pill pill--ghost-light pill--sm">{shareLabel}</button>
            </div>
          </div>
        </div>
        <div className="subnav">
          <nav aria-label="On this page">
            <a href="#overview">Overview</a><a href="#features">Features</a><a href="#inspections">Inspections</a><a href="#location">Location</a>
          </nav>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href={PAGES.guides + "?guide=buyer#offer"} className="pill pill--ghost-light pill--sm hide-m">Make an offer</Link>
            <a href="#enquire" className="pill pill--white pill--sm" style={{ padding: "0 20px" }}>Enquire now</a>
          </div>
        </div>
      </section>

      <section className="section--white" style={{ padding: "clamp(48px,6vw,80px) var(--pad-x) var(--sec-y)" }}>
        <div className="prop-cols">
          <div style={{ display: "grid", gap: "clamp(48px,6vw,80px)", minWidth: 0 }}>
            <div id="overview" className="prop-block" style={{ gap: 20 }}>
              <div className="mono-note">{sourceNote}</div>
              <Lines className="h3" style={{ fontSize: "clamp(1.6rem,1.1rem + 1.8vw,2.6rem)", letterSpacing: "-.025em", lineHeight: 1.08, textWrap: "balance" }} lines={[headline]} />
              <p data-reveal className="lead" style={{ lineHeight: 1.65, maxWidth: "64ch" }}>{desc1}</p>
              <p data-reveal className="lead" style={{ lineHeight: 1.65, maxWidth: "64ch" }}>{desc2}</p>
            </div>
            <div data-reveal className="rows">
              <div className="kicker" style={{ marginBottom: 16 }}>Property details</div>
              {details.map(([k, v]) => (<div key={k} className="row row--wide"><span className="row__k">{k}</span><span className="row__v">{String(v)}</span></div>))}
            </div>
            <div id="features" data-reveal className="prop-block">
              <div className="kicker">Property features</div>
              <div className="features">{features.map((f) => (<div key={f} className="feature"><span aria-hidden="true" />{f}</div>))}</div>
            </div>
            <div id="inspections" data-reveal className="prop-block">
              <div className="kicker">Inspection times</div>
              {inspections.length ? (
                <div style={{ display: "grid" }}>
                  {inspections.map((i) => (
                    <div key={i.file} className="insp">
                      <div style={{ display: "grid", gap: 2 }}><span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>{i.day}</span><span style={{ fontSize: 14, color: "var(--grey)" }}>{i.time}</span></div>
                      <a href={i.ics} download={i.file} className="pill pill--ghost pill--sm">Add to calendar <span aria-hidden="true">↓</span></a>
                    </div>
                  ))}
                  <div className="rule" />
                </div>
              ) : (
                <div style={{ padding: "18px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", fontSize: 15, color: "var(--grey-2)" }}>No open homes scheduled. Contact the agent to arrange a private inspection.</div>
              )}
              <p className="small">After-hours viewings are available by appointment through the team on <a href={CONTACT.phoneHref} style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "none" }}>{CONTACT.phone}</a>.</p>
            </div>
            <div id="floorplan" data-reveal className="prop-block">
              <div className="kicker">Floor plan</div>
              {p.floorplans && p.floorplans.length ? (
                <div style={{ display: "grid", gap: 16 }}>
                  {p.floorplans.map((src, i) => (
                    <a key={src} href={src} target="_blank" rel="noopener" className="floorplan" aria-label={"Open floor plan " + (i + 1) + " full size"}>
                      <Image src={src} alt={"Floor plan " + (p.floorplans!.length > 1 ? i + 1 : "") + " for " + p.address + ", " + p.suburb} width={(FLOORPLAN_DIMS[src] || [1600, 1200])[0]} height={(FLOORPLAN_DIMS[src] || [1600, 1200])[1]} sizes="(max-width: 980px) 100vw, 60vw" quality={85} style={{ width: "100%", height: "auto" }} />
                    </a>
                  ))}
                  <p className="small">Click a plan to open it full size.</p>
                </div>
              ) : (
                <div style={{ padding: "18px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", fontSize: 15, color: "var(--grey-2)" }}>No floor plan has been supplied for this property. Download the brochure or contact the agent for layout details.</div>
              )}
            </div>
            <div id="location" data-reveal className="prop-block">
              <div className="kicker">Location</div>
              {hasMap ? <PropertyMap p={p} /> : <p style={{ margin: 0, fontSize: 15, color: "var(--grey-2)" }}>{p.address}, {p.suburb}{p.postcode ? " QLD " + p.postcode : ""}</p>}
              <Link href={suburbHref} className="text-link">More properties in {p.suburb} <span data-arrow className="text-link__ring" aria-hidden="true">→</span></Link>
            </div>
            {isSale && (
              <div data-reveal className="eoi">
                <div style={{ display: "grid", gap: 6 }}><div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.01em" }}>Interested? Submit an expression of interest.</div><div className="small">A written offer with price, deposit, finance and settlement terms, signed online.</div></div>
                <Link href={PAGES.guides + "?guide=buyer#offer"} className="pill pill--dark pill--md">Make an offer</Link>
              </div>
            )}
          </div>

          <aside id="enquire" className="enquire">
            <div className="enquire__card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "grid", gap: 4 }}><div className="kicker kicker--light" style={{ letterSpacing: ".14em" }}>{isRent ? "Weekly rent" : isSold ? (/\d/.test(priceText || "") ? "Sold price" : "Status") : "Price"}</div><div style={{ fontSize: "clamp(1.4rem,1.2rem + .8vw,1.9rem)", fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1 }}>{priceText}</div></div>
                {inspections.length > 0 && (<div style={{ textAlign: "right", display: "grid", gap: 2 }}><div className="kicker kicker--light" style={{ letterSpacing: ".14em" }}>Next open home</div><div style={{ fontSize: 14, fontWeight: 700 }}>{inspections[0].day} · {inspections[0].time}</div></div>)}
              </div>
              {!sent ? (
                <form style={{ display: "grid", gap: 12 }} onSubmit={(e) => { e.preventDefault(); setName(String(new FormData(e.currentTarget).get("name") || "").split(" ")[0]); setSent(true); }}>
                  <label className="field field--dark">Full name<input name="name" required autoComplete="name" className="input input--dark" /></label>
                  <label className="field field--dark">Email<input name="email" type="email" required autoComplete="email" className="input input--dark" /></label>
                  <label className="field field--dark">Phone <span className="opt">(optional)</span><input name="phone" type="tel" autoComplete="tel" className="input input--dark" /></label>
                  <label className="field field--dark">Comments<textarea name="comments" required rows={3} placeholder={"I’d like to know more about " + p.address + "."} className="input input--dark" /></label>
                  <input type="hidden" name="property" value={p.address} />
                  <button type="submit" className="pill pill--red" style={{ justifyContent: "center", marginTop: 4 }}>Send enquiry</button>
                  <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--grey-3)" }}>By sending you agree to our <a href="https://redrocketrealty.com.au/privacy-policy/" target="_blank" rel="noopener" style={{ color: "var(--grey-light)", fontWeight: 700 }}>Privacy Policy</a>. The listing agent is notified directly.</div>
                </form>
              ) : (
                <Success title="Enquiry sent." light onReset={() => setSent(false)}>Thanks, {name}. {agent.first} will be in touch about {p.address}.</Success>
              )}
            </div>
            <div className="enquire__agent">
              <div className="enquire__face" style={{ position: "relative", backgroundImage: agent.photo ? undefined : "repeating-linear-gradient(135deg,rgba(17,19,24,.035) 0 8px,transparent 8px 16px)" }}>{agent.photo ? <Photo src={agent.photo} sizes="72px" position="center top" /> : "photo"}</div>
              <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>{agent.name}</div>
                <div style={{ fontSize: 13, color: "var(--grey)" }}>{agent.role}</div>
                <a href={agent.tel} style={{ fontSize: 14, fontWeight: 700, color: "var(--brand-red)", textDecoration: "none", marginTop: 4 }}>{agent.mobile}</a>
                <a href={"mailto:" + agent.email} style={{ fontSize: 13, color: "var(--grey-2)", textDecoration: "none", wordBreak: "break-all" }}>{agent.email}</a>
              </div>
            </div>
            <Link href={suburbHref + "#alerts"} className="enquire__alert"><span>Get alerts for new listings in {p.suburb}</span><span aria-hidden="true" style={{ color: "var(--brand-red)" }}>→</span></Link>
          </aside>
        </div>
      </section>

      <section className="section--bg" style={{ padding: "var(--sec-y) 0", overflow: "hidden" }}>
        <div className="sec-head px">
          <div className="sec-head__text"><div className="kicker">Similar properties</div><Lines className="h2" lines={["More to explore nearby."]} /></div>
          <Link href={listHref} className="pill pill--dark" style={{ flex: "none" }}>All {listLabel.toLowerCase()}</Link>
        </div>
        <div className="strip">
          {similar.map((x) => <PropertyCard key={x.id} p={x} width="min(420px,84vw)" />)}
          <div className="strip-end" aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}
