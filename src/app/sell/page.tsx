import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";
import PropertyCard from "@/components/PropertyCard";
import { ADVANTAGE, CONTACT, PAGES, PHOTOS, SOLD, STORIES } from "@/data/rr-data";
import Photo from "@/components/Photo";

export const metadata: Metadata = { title: "Sell your home", description: "A hands-on sale from the first appraisal to settlement day with Logan's local experts." };

const STEPS: [string, string][] = [
  ["Appraisal", "A local agent visits, compares recent sales and gives you a realistic price range."],
  ["Prepare", "Presentation advice, an optional pre-sale building inspection, and professional photography."],
  ["Launch", "Listed on our site and the major portals, with signage, open homes and buyer alerts on day one."],
  ["Negotiate", "Every offer is presented in writing. We negotiate price and terms with your goals in mind."],
  ["Settle", "Contract to settlement handled with your solicitor. Then we help you find what comes next."],
];
const COVERS = [PHOTOS.boskLiving, PHOTOS.hunterLiving, PHOTOS.limeLiving, PHOTOS.parfreyDeck];

export default function SellPage() {
  return (
    <>
      <Header />
      <main>
        <section className="hero" style={{ minHeight: "88svh" }}>
          <div className="bsr__bg" aria-hidden="true"><Photo src={PHOTOS.heroPoster} sizes="100vw" priority quality={75} /></div>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,.1) 40%,rgba(15,17,20,.95) 100%)" }} />
          <div style={{ position: "relative", width: "100%", padding: "170px var(--pad-x) clamp(56px,7vw,96px)", display: "grid", gap: 24 }}>
            <Crumb tone="light" items={[["Sell"]]} />
            <Lines as="h1" className="display-xl" style={{ fontSize: "clamp(2.6rem,1.4rem + 5vw,6.4rem)", letterSpacing: "-.035em", lineHeight: .96, maxWidth: "14ch" }} lines={["Sell your home", <>with Logan&apos;s <span style={{ color: "var(--red)" }}>local experts.</span></>]} />
            <div className="stack-m" style={{ flexWrap: "wrap", gap: 32 }}>
              <p style={{ fontSize: "clamp(17px,1.4vw,21px)", lineHeight: 1.5, color: "var(--grey-light)", maxWidth: "52ch" }}>A hands-on sale from the first appraisal to settlement day: the right price, the right buyers, and a team that stays in touch the whole way.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Link href={PAGES.appraisal} className="pill pill--white pill--lg pill--arrow"><span>Request a free appraisal</span><span className="pill__arrow" aria-hidden="true">→</span></Link>
                <Link href={PAGES.listings + "?mode=sold"} className="pill pill--ghost-light pill--lg">See recent sales</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section--ink" style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <div data-stagger className="proof px">
            <div data-glow><div className="proof__n">$1.5M</div><div className="proof__k">Highest recent sale · 89 Passerine Drive, Rochedale South</div></div>
            <div data-glow><div className="proof__n">4.9<span style={{ color: "var(--red)" }}>★</span></div><div className="proof__k">RateMyAgent rating across {CONTACT.reviews} reviews</div></div>
            <div data-glow><div className="proof__n">2017 · 2019</div><div className="proof__k">Agent of the Year, Underwood</div></div>
            <div data-glow><div className="proof__n">25+ yrs</div><div className="proof__k">Selling across Logan City <span className="mono-note mono-note--light" style={{ fontSize: 10 }}>· confirm</span></div></div>
          </div>
        </section>

        <section id="advantage" className="section section--white" style={{ scrollMarginTop: 90 }}>
          <div className="cols2" style={{ gridTemplateColumns: "minmax(0,5fr) minmax(0,7fr)" }}>
            <div className="sticky" style={{ display: "grid", gap: 20 }}>
              <div className="kicker">The Red Rocket Advantage</div>
              <Lines className="h2" lines={["Blast off with", "Logan's leading agents."]} />
              <p data-reveal className="lead" style={{ lineHeight: 1.65, maxWidth: "48ch" }}>Buying or selling, we use varied sales techniques and local knowledge to increase your property&apos;s value and reach the right buyers faster.</p>
            </div>
            <div data-stagger style={{ display: "grid" }}>
              {ADVANTAGE.map(([title, body], i) => (
                <div key={title} data-glow className="step-row">
                  <div data-glow-n className="step-row__n">0{i + 1}</div>
                  <div style={{ display: "grid", gap: 10 }}><div data-glow-t className="step-row__title">{title}</div><p>{body}</p></div>
                </div>
              ))}
              <div className="rule" />
            </div>
          </div>
        </section>

        <section className="section section--bg">
          <div className="sec-head" style={{ marginBottom: 48 }}>
            <div className="sec-head__text"><div className="kicker">How a sale runs</div><Lines className="h2" lines={["Five steps, one team."]} /></div>
            <Link href={PAGES.guides + "?guide=seller"} className="text-link" style={{ flex: "none" }}>Read the seller guide <span data-arrow className="text-link__ring" aria-hidden="true">→</span></Link>
          </div>
          <div data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 16 }}>
            {STEPS.map(([title, body], i) => (
              <div key={title} data-glow="card" data-tilt="lift" className="step-card"><div data-glow-n className="step-card__n">{i + 1}</div><div className="step-card__title">{title}</div><p>{body}</p></div>
            ))}
          </div>
        </section>

        <section className="section--dark" style={{ padding: "var(--sec-y) 0", overflow: "hidden" }}>
          <div className="sec-head px">
            <div className="sec-head__text"><div className="kicker">Just sold</div><Lines className="h2" lines={["Results that speak", "for themselves."]} /></div>
            <Link href={PAGES.listings + "?mode=sold"} className="pill pill--white" style={{ flex: "none" }}>All sold properties</Link>
          </div>
          <div className="strip">
            {SOLD.slice(0, 8).map((p) => <PropertyCard key={p.id} p={p} light ratio="4/3" width="min(380px,80vw)" specsCount={3} priceOverride={(p.price || "").replace("Sold ", "")} />)}
            <div className="strip-end" aria-hidden="true" />
          </div>
        </section>

        <section className="section section--white">
          <div style={{ display: "grid", gap: 16, marginBottom: 48, maxWidth: 720 }}><div className="kicker">Client stories</div><Lines className="h2" lines={["Sellers on selling", "with Red Rocket."]} /></div>
          <div data-stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 24 }}>
            {STORIES.map((v, i) => (
              <a key={v.wistia} data-card href={"https://fast.wistia.net/embed/iframe/" + v.wistia} target="_blank" rel="noopener" className="card">
                <div className="story__media">
                  <div data-zoom style={{ position: "absolute", inset: 0, backgroundColor: "#23262d" }}><Photo src={COVERS[i]} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" /></div>
                  <div className="story__shade" aria-hidden="true" />
                  <div className="story__play"><span data-arrow aria-hidden="true">▶</span></div>
                  <div className="story__note">Wistia · {v.wistia} · 2017 · re-confirm consent</div>
                </div>
                <div style={{ display: "grid", gap: 4 }}><div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.01em" }}>{v.title}</div><div style={{ fontSize: 13, fontWeight: 700, color: "var(--red)" }}>{v.who}</div><p className="small" style={{ marginTop: 4, fontSize: 14, lineHeight: 1.55, color: "var(--grey-2)" }}>{v.gist}</p></div>
              </a>
            ))}
          </div>
        </section>

        <section className="section section--red">
          <div className="cta-band">
            <div style={{ display: "grid", gap: 14, maxWidth: 720 }}>
              <div className="kicker kicker--white">Free appraisal</div>
              <Lines className="display-md" style={{ fontSize: "clamp(2.2rem,1.2rem + 3.4vw,4.4rem)", lineHeight: 1 }} lines={["How much is your", "home worth today?"]} />
              <p style={{ fontSize: 17, lineHeight: 1.55, maxWidth: "52ch" }}>Tell us about the property and a local agent will be in touch within one business day with a market appraisal. No obligation.</p>
            </div>
            <Link href={PAGES.appraisal} className="pill pill--dark pill--lg pill--arrow pill--red pill--dark-arrow" style={{ background: "var(--ink)", fontSize: 16, height: 64 }}><span>Start my appraisal</span><span className="pill__arrow" aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
