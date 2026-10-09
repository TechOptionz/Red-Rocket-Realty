"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ADVANTAGE, CONTACT, PAGES, PHOTOS, TESTIMONIALS } from "@/data/rr-data";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";
import Photo from "@/components/Photo";
import useScrollFill from "@/lib/useScrollFill";

const TEXT = "Every buyer, seller, landlord and tenant is different, so the service is tailored. From our office in Springwood we pair thorough local knowledge with personable service, and we look after everything from the paperwork to the finance.";
const MILESTONES = [
  { year: "2000s", title: "Red Rocket Realty opens in Springwood", body: "An independent agency at 67 Springwood Road serving Logan City and surrounding suburbs." },
  { year: "2017", title: "Agent of the Year, Underwood", body: "Parnam Singh Heir named Agent of the Year for Underwood, repeated in 2019." },
  { year: "2025", title: "First National Rochedale team joins", body: "Frances Fernandez, Teresa Stewart, Tony and Alexandra Fernandez bring a decade of Rochedale and Mt Gravatt experience." },
  { year: "Today", title: "19 people, 485 reviews, 4.9 stars", body: "Sales, property management, leasing and inspections under one roof." },
];
const KINDS = ["All", "Sellers", "Buyers", "Landlords"];

export default function AboutClient() {
  const stmt = useRef<HTMLParagraphElement>(null);
  const fill = useScrollFill(stmt);
  const [filter, setFilter] = useState("All");
  const words = TEXT.split(" ");
  const on = Math.round((words.length * fill) / 100);
  const match = (who: string) => filter === "All" || (filter === "Sellers" && /Vendor/.test(who)) || (filter === "Buyers" && /buyer/i.test(who)) || (filter === "Landlords" && /Landlord/.test(who));
  const reviews = TESTIMONIALS.filter((r) => match(r.who));

  return (
    <main>
      <section className="hero hero--page" style={{ minHeight: "88svh" }}>
        <div className="bsr__bg" aria-hidden="true"><Photo src={PHOTOS.hero.about} sizes="100vw" priority quality={75} /></div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__body">
          <Crumb tone="light" items={[["About"]]} />
          <div className="kicker kicker--photo">Our story</div>
          <Lines as="h1" className="display-xl" style={{ fontSize: "clamp(2.6rem,1.4rem + 5vw,6.4rem)", letterSpacing: "-.035em", lineHeight: .96 }} lines={["Logan locals,", <>for over <span style={{ color: "var(--brand-red)" }}>25 years.</span></>]} />
          <p className="hero__sub">Red Rocket Realty is committed to the property needs of Logan residents. We are focused on maintaining our position as the leading real estate agents in the area and the local experts that people can rely on and trust.</p>
        </div>
      </section>

      <section className="section section--white">
        <p ref={stmt} className="words">{words.map((w, i) => (<span key={i} className="word" data-on={i < on ? "1" : "0"}>{w}&nbsp;</span>))}</p>
      </section>

      <section className="section section--dark">
        <div className="cols2" style={{ gridTemplateColumns: "1fr 1.1fr" }}>
          <div className="sticky" style={{ display: "grid", gap: 22 }}>
            <div className="kicker">How we work</div>
            <Lines className="h2" lines={["The Red Rocket", "Advantage."]} />
            <p data-reveal className="lead lead--light" style={{ maxWidth: "44ch" }}>Four commitments we make to every seller, buyer, landlord and tenant.</p>
            <Link data-mag href={PAGES.sell + "#advantage"} className="pill pill--white pill--arrow" style={{ width: "max-content" }}><span>Sell with us</span><span className="pill__arrow" aria-hidden="true">→</span></Link>
          </div>
          <div style={{ display: "grid" }}>
            {ADVANTAGE.map(([title, body], i) => (
              <div key={title} data-reveal data-glow="row" className="numbered numbered--light"><div data-glow-n className="numbered__n">0{i + 1}</div><div style={{ display: "grid", gap: 10 }}><h3 data-glow-t className="numbered__title">{title}</h3><p className="numbered__body">{body}</p></div></div>
            ))}
            <div className="rule rule--light" />
          </div>
        </div>
      </section>

      <section className="section section--bg">
        <div style={{ display: "grid", gap: 18, marginBottom: 48, maxWidth: 720 }}><div className="kicker">Milestones</div><Lines className="h2" lines={["From Springwood,", "across Logan."]} /></div>
        <div data-stagger className="tl">
          {MILESTONES.map((m) => (
            <div key={m.year} data-glow="row"><div data-glow-n className="tl__year">{m.year}</div><div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>{m.title}</div><p className="small" style={{ fontSize: 15, lineHeight: 1.55, color: "var(--grey-2)" }}>{m.body}</p></div>
          ))}
        </div>
        <p data-reveal className="mono-note" style={{ marginTop: 32 }}>Dates from the content pack and the current site · founding year and the &quot;over 25 years&quot; claim to be confirmed by the agency</p>
      </section>

      <section id="reviews" className="section section--white" style={{ scrollMarginTop: 100 }}>
        <div className="cols2" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
          <div className="sticky" style={{ display: "grid", gap: 22 }}>
            <div className="kicker">Reviews</div>
            <Lines className="h2" lines={["Rated 4.9", "by 485 clients."]} />
            <div data-reveal style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, fontWeight: 700 }}><span className="stars" aria-hidden="true" style={{ fontSize: 18 }}>★★★★★</span><span>RateMyAgent · verified reviews</span></div>
            <a data-reveal href={CONTACT.rma} target="_blank" rel="noopener" className="text-link">Read all reviews on RateMyAgent <span data-arrow className="text-link__ring" aria-hidden="true">↗</span></a>
          </div>
          <div style={{ display: "grid" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              {KINDS.map((k) => <button key={k} type="button" className="chip chip--white chip--sm" data-on={k === filter ? "1" : "0"} onClick={() => setFilter(k)}>{k}</button>)}
            </div>
            {reviews.map((r, i) => (
              <blockquote key={filter + r.text} className="review" style={{ animationDelay: Math.min(i, 6) * 0.06 + "s" }}>
                <div className="stars" aria-hidden="true" style={{ fontSize: 14 }}>★★★★★</div>
                <p>&quot;{r.text}&quot;</p>
                <footer>{r.who} · {r.agent}</footer>
              </blockquote>
            ))}
            <div className="mono-note" style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>Paraphrased from the Testimonials page and RateMyAgent · publish verbatim wording with client permission</div>
          </div>
        </div>
      </section>

      <section className="alerts-band">
        <div className="cta-band">
          <div style={{ display: "grid", gap: 12, maxWidth: 640 }}><div className="kicker">Our team</div><h2 className="h2--sm">Meet the nineteen people behind the results.</h2></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href={PAGES.team} className="pill pill--white pill--arrow"><span>Meet the team</span><span className="pill__arrow" aria-hidden="true">→</span></Link>
            <Link href={PAGES.contact} className="pill pill--ghost-light">Contact us</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
