"use client";
import { useState } from "react";
import Link from "next/link";
import { CONTACT, LAND, PAGES, RENT, SALE, SOLD, agentByName, decorate, formatRent, propHref, specs, type Listing } from "@/data/rr-data";
import { icsFor } from "@/lib/ics";
import Lines from "@/components/Lines";
import PropertyCard from "@/components/PropertyCard";
import Success from "@/components/Success";

const STRIPE = "repeating-linear-gradient(135deg,rgba(255,255,255,.022) 0 12px,transparent 12px 24px)";

export default function PropertyClient({ p }: { p: Listing }) {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [shareLabel, setShareLabel] = useState("Share");

  const isRent = !!p.rent, isSold = p.status === "Sold", isLand = p.type === "Land", isSale = !isRent && !isSold;
  const mode = isRent ? "rent" : isSold ? "sold" : isLand ? "land" : "buy";
  const listLabel = isRent ? "For rent" : isSold ? "Recently sold" : isLand ? "Land for sale" : "For sale";
  const listHref = PAGES.listings + "?mode=" + mode;
  const suburbHref = listHref + "&suburb=" + encodeURIComponent(p.suburb);
  const priceText = isRent ? formatRent(p.rent!) : isSold ? "Sold · price from feed" : p.price;
  const ag = p.agent ? agentByName(p.agent) : undefined;
  const agent = isRent
    ? { name: "Red Rocket Realty Rentals", role: "Rentals and inspections", mobile: CONTACT.phone, tel: CONTACT.phoneHref, email: CONTACT.inspections, first: "Our rentals team", photo: "" }
    : ag
      ? { name: ag.name, role: ag.role, mobile: ag.mobile, tel: "tel:+61" + ag.mobile.replace(/\D/g, "").slice(1), email: ag.email, first: ag.name.split(" ")[0], photo: ag.photo }
      : { name: "Parnam Singh Heir", role: "Principal / Director", mobile: "0434 289 285", tel: "tel:+61434289285", email: "parnam@redrocketrealty.com.au", first: "Parnam", photo: "" };
  const photos = p.photos || [];
  const thumbs = [1, 2, 3, 4].map((i) => (photos[i] ? `url("${photos[i]}")` : STRIPE));
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
  const siteHref = p.listingId ? "https://redrocketrealty.com.au/" + (isLand ? "land" : "property") + "/" + (p.address + "-" + p.suburb + "-qld-" + (p.postcode || "")).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "/" : "#overview";
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
        <div className="gallery">
          <a data-reveal="clip" href={photos[0] || "#overview"} target="_blank" rel="noopener" aria-label="Open gallery" className="gallery__main">
            <div data-zoom className="card__img" style={{ backgroundColor: p.shade, backgroundImage: dec.bgImage, padding: 24 }}>{dec.imgTag ? (<><span>{dec.imgTag}</span><br /><span>{dec.img}</span></>) : null}</div>
            {p.status ? <span className={"tag" + (isSold ? " tag--sold" : "")} style={{ padding: "10px 14px", letterSpacing: ".14em" }}>{p.status}</span> : null}
          </a>
          <div className="gallery__thumbs">
            {[1, 2, 3].map((i) => (
              <a key={i} href={photos[i] || "#overview"} target="_blank" rel="noopener" aria-label={"Photo " + (i + 1)} className="gallery__thumb">
                <div data-zoom style={{ backgroundImage: thumbs[i - 1] }}>{photos[i] ? "" : ["Kitchen", "Living", "Bedroom"][i - 1]}</div>
              </a>
            ))}
            <a href={siteHref} target="_blank" rel="noopener" aria-label="View all photos" className="gallery__thumb" style={{ background: "#262a31" }}>
              <div data-zoom style={{ backgroundImage: thumbs[3] }} />
              <div className="gallery__more"><b>{photos.length || (isLand ? 2 : 25)}</b><span>View all photos</span></div>
            </a>
          </div>
        </div>
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
              <div className="placeholder" style={{ aspectRatio: "16/9" }}>[FLOOR PLAN · feed · opens full size]</div>
            </div>
            <div id="location" data-reveal className="prop-block">
              <div className="kicker">Location</div>
              <div className="placeholder placeholder--stripe" style={{ aspectRatio: "16/8" }}><span>[MAP · zoom 17 · rocket pin]</span><br /><span>{p.address}, {p.suburb}</span></div>
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
                <div style={{ display: "grid", gap: 4 }}><div className="kicker kicker--light" style={{ letterSpacing: ".14em" }}>{isRent ? "Weekly rent" : isSold ? "Status" : "Price"}</div><div style={{ fontSize: "clamp(1.4rem,1.2rem + .8vw,1.9rem)", fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1 }}>{priceText}</div></div>
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
              <div className="enquire__face" style={{ backgroundImage: agent.photo ? `url("${agent.photo}")` : "repeating-linear-gradient(135deg,rgba(17,19,24,.035) 0 8px,transparent 8px 16px)" }}>{agent.photo ? "" : "photo"}</div>
              <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>{agent.name}</div>
                <div style={{ fontSize: 13, color: "var(--grey)" }}>{agent.role}</div>
                <a href={agent.tel} style={{ fontSize: 14, fontWeight: 700, color: "var(--red)", textDecoration: "none", marginTop: 4 }}>{agent.mobile}</a>
                <a href={"mailto:" + agent.email} style={{ fontSize: 13, color: "var(--grey-2)", textDecoration: "none", wordBreak: "break-all" }}>{agent.email}</a>
              </div>
            </div>
            <Link href={suburbHref + "#alerts"} className="enquire__alert"><span>Get alerts for new listings in {p.suburb}</span><span aria-hidden="true" style={{ color: "var(--red)" }}>→</span></Link>
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
