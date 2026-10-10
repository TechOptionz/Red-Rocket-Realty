"use client";
import { useState } from "react";
import Link from "next/link";
import { ADVANTAGE, AREAS, CONTACT, PAGES, PHOTOS, SOLD, propHref, specs } from "@/data/rr-data";
import Lines from "@/components/Lines";
import Intro from "./Intro";
import Hero from "./Hero";
import FeaturedStrip from "./FeaturedStrip";
import Statement from "./Statement";
import PMSection from "./PMSection";
import Stats from "./Stats";
import TeamStrip from "./TeamStrip";
import Reviews from "./Reviews";
import NewsSection from "./NewsSection";
import AppraisalCta, { type ApprState } from "./AppraisalCta";
import ContactSection from "./ContactSection";
import Photo from "@/components/Photo";

const SUBURBS = ["Springwood", "Rochedale South", "Underwood", "Woodridge", "Kingston", "Marsden", "Slacks Creek", "Kuraby", "Shailer Park", "Logan Central"];
const AREA_IMGS = [
  [PHOTOS.barbarallaFacade, "Springwood · 9/93 Barbaralla Drive"],
  [PHOTOS.heroPoster, "Rochedale South · 89 Passerine Drive, sold $1.5M"],
  [PHOTOS.rioFront, "Underwood · 12 Rio Court, sold $1.05M"],
  [PHOTOS.hunterFacade, "Woodridge · 8 Hunter Street"],
];

export default function HomeClient() {
  const [appr, setAppr] = useState<ApprState>({ step: 0, addr: "", kind: "" });
  const sold = SOLD.filter((p) => p.photo).slice(0, 6);

  return (
    <main>
      <Intro />
      <Hero onAppraise={(addr) => setAppr({ step: 1, addr, kind: "" })} />

      {/* Intro / about */}
      <section id="about" className="about">
        <div data-reveal className="trust">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span className="stars" aria-hidden="true" style={{ fontSize: 16 }}>★★★★★</span><span>{CONTACT.rating} out of 5</span><span style={{ color: "var(--grey)", fontWeight: 500 }}>Based on {CONTACT.reviews} reviews</span></div>
          <a href={CONTACT.rma} target="_blank" rel="noopener">RateMyAgent <span aria-hidden="true">↗</span></a>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span>Award Winning Agency &amp; Agent 2017–2026</span><span className="mono-tag">confirm wording</span></div>
          <div style={{ marginLeft: "auto", color: "var(--grey)", fontWeight: 500 }}>Logan City and surrounding areas · since the 1990s<span className="mono-tag" style={{ marginLeft: 8 }}>25+ yrs · verify</span></div>
        </div>
        <div className="about__grid">
          <div className="about__text">
            <div style={{ display: "grid", gap: 28 }}>
              <div className="kicker">About Red Rocket Realty</div>
              <Lines className="display-md" lines={["Logan's leading agents,", "and the local experts", "you can rely on and trust."]} />
            </div>
            <p data-reveal className="lead" style={{ maxWidth: "52ch", transitionDelay: ".1s" }}>Red Rocket Realty is committed to the property needs of Logan residents. From our office in Springwood we help people buy, sell and rent across Springwood, Rochedale South, Underwood, Woodridge and beyond, pairing thorough local knowledge with personable service. Every buyer, seller and renter is different, so the service is tailored, and we look after everything from paperwork to finance.</p>
            <div data-reveal style={{ display: "flex", flexWrap: "wrap", gap: 10, transitionDelay: ".2s" }}>
              <a href="#team" className="pill pill--dark pill--arrow"><span>Meet the team</span><span className="pill__arrow" aria-hidden="true">→</span></a>
              <a href="#reviews" className="pill pill--ghost">Read our reviews</a>
            </div>
          </div>
          <div data-reveal="clip" className="about__img">
            <div className="photo-full"><Photo src={PHOTOS.office} alt="Red Rocket Realty office at 67 Springwood Road, Springwood" sizes="(max-width: 980px) 100vw, 50vw" /></div>
            <div className="img-note">Our office · 67 Springwood Road, Springwood</div>
          </div>
        </div>
      </section>

      <FeaturedStrip />

      {/* Buy / Sell / Rent */}
      <section className="bsr">
        {[
          { href: PAGES.listings + "?mode=buy", img: PHOTOS.parkwayFacade, pos: undefined as string | undefined, n: "01 · Interested in buying?", t: "Buy", p: "Houses, units, townhouses and land across Logan. Filter by suburb, type, price and features, or set an email alert and let the listings come to you.", cta: "Start searching now!" },
          { href: PAGES.appraisal, img: PHOTOS.pool, n: "02 · Thinking of selling?", t: "Sell", p: "Hands-on from pricing to paperwork to negotiating with buyers. Local agents who know Logan values and how to present a home for its maximum price.", cta: "Sell your home today!" },
          { href: PAGES.listings + "?mode=rent", img: PHOTOS.limeLiving, pos: "center 68%", n: "03 · Looking for a rental?", t: "Rent", p: "Current rentals with weekly rent, availability and inspection times you can save to your calendar. After-hours viewings by appointment through our rentals team.", cta: "View properties for rent" },
        ].map((x) => (
          <Link key={x.t} href={x.href} className="bsr__panel">
            <div className="bsr__bg" aria-hidden="true"><Photo src={x.img} sizes="(max-width: 980px) 100vw, 34vw" position={x.pos} /></div>
            <div className="bsr__shade" aria-hidden="true" />
            <div className="bsr__body">
              <div className="bsr__n">{x.n}</div>
              <div className="bsr__title">{x.t}</div>
              <div className="bsr__desc">
                <p>{x.p}</p>
                <span className="bsr__cta">{x.cta} <span data-arrow aria-hidden="true">→</span></span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <Statement />

      <section className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map((k) => SUBURBS.map((s) => (<span key={k + s} style={{ display: "contents" }}><span>{s}</span><span>●</span></span>)))}
        </div>
      </section>

      {/* Advantage */}
      <section className="section section--white">
        <div className="cols2" style={{ gridTemplateColumns: "1fr 1.1fr" }}>
          <div className="sticky" style={{ display: "grid", gap: 24 }}>
            <div className="kicker">The Red Rocket Advantage</div>
            <Lines className="display-md" style={{ fontSize: "clamp(2.2rem,1.2rem + 3.2vw,4.4rem)" }} lines={["Blast off with Logan's", "leading real estate team."]} />
            <p data-reveal className="lead" style={{ maxWidth: "44ch" }}>A results-focused team that provides property services with the highest level of integrity, through every step of the selling cycle.</p>
            <div data-reveal style={{ display: "flex", flexWrap: "wrap", gap: 10, transitionDelay: ".1s" }}>
              <a href="#appraisal" className="pill pill--red pill--arrow"><span>Request an appraisal</span><span className="pill__arrow" aria-hidden="true">→</span></a>
              <a href={CONTACT.phoneHref} className="pill pill--ghost">Call {CONTACT.phone}</a>
            </div>
          </div>
          <div style={{ display: "grid" }}>
            {ADVANTAGE.map(([title, body], i) => (
              <div key={title} data-reveal data-glow="row" className="adv">
                <div data-glow-n className="adv__n">0{i + 1}</div>
                <div style={{ display: "grid", gap: 12 }}><h3 data-glow-t className="h3">{title}</h3><p className="body" style={{ maxWidth: "52ch" }}>{body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently sold */}
      <section className="section section--dark">
        <div className="sec-head" style={{ marginBottom: 48 }}>
          <div className="sec-head__text" style={{ gap: 18 }}>
            <div className="kicker">Just sold</div>
            <Lines className="h2" lines={["Results across Logan."]} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: "none" }}>
            <Link data-mag href={PAGES.listings + "?mode=sold"} className="pill pill--ghost-light">View all sold</Link>
            <a href="#appraisal" className="pill pill--red">Sell your home today!</a>
          </div>
        </div>
        <div className="sold-grid">
          {sold.map((p, i) => {
            return (
              <Link key={p.id} data-card data-tilt data-reveal href={propHref(p)} className="sold-card" style={{ transitionDelay: (i % 3) * 0.08 + "s" }}>
                <div data-zoom className="card__img" style={{ backgroundColor: p.shade, padding: 24 }}><Photo src={p.photo!} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" /></div>
                <div data-dim aria-hidden="true" style={{ position: "absolute", inset: 0, background: "#000", opacity: 0 }} />
                <div className="sold-card__shade" aria-hidden="true" />
                <span className="tag" style={{ padding: "9px 14px", letterSpacing: ".14em" }}>Sold</span>
                <div className="sold-card__body">
                  <div className="sold-card__price">{p.price}</div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{p.address}, {p.suburb}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--grey-light)" }}>{specs(p).slice(0, 3).join(" · ")}</div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mono-note mono-note--light" style={{ paddingTop: 28 }}>Sale prices shown from the feed (&quot;Sold $—&quot;) · sold listings keep their existing addresses</div>
      </section>

      {/* Explore Logan */}
      <section className="areas">
        <div className="areas__grid">
          <div style={{ display: "grid", gap: 32, alignContent: "start", paddingRight: "var(--pad-x)" }}>
            <div style={{ display: "grid", gap: 18 }}>
              <div className="kicker">Explore Logan</div>
              <Lines className="h2" lines={["The suburbs", "we call home."]} />
            </div>
            <div data-reveal style={{ display: "grid" }}>
              {AREAS.map((a, i) => (
                <Link key={a.name} data-area={i} href={PAGES.listings + "?mode=buy&suburb=" + encodeURIComponent(a.name)} className="area">
                  <div style={{ display: "grid", gap: 4 }}><div className="area__name">{a.name}</div><div className="area__line">{a.line}</div></div>
                  <span data-arrow className="area__arrow" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
            <p data-reveal className="small" style={{ fontSize: 15, lineHeight: 1.55, maxWidth: "44ch" }}>Also active in Kingston, Marsden, Slacks Creek, Kuraby, Shailer Park and Logan Central. Service area list to be confirmed by the agency.</p>
          </div>
          <div data-reveal="clip" className="areas__bleed">
            <div style={{ position: "absolute", inset: 0 }}>
              {AREA_IMGS.map(([img, cap], i) => (
                <div key={i} className="areas__bg" data-bg={i}><Photo src={img} sizes="(max-width: 980px) 100vw, 55vw" />
                  <div className="areas__cap"><span aria-hidden="true" />{cap}</div>
                </div>
              ))}
              <div className="areas__fade" aria-hidden="true" />
              <div className="areas__fade2" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <PMSection />
      <Stats />
      <TeamStrip />
      <Reviews />
      <NewsSection />
      <AppraisalCta state={appr} setState={setAppr} />
      <ContactSection />
    </main>
  );
}
