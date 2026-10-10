"use client";
import { useState } from "react";
import Link from "next/link";
import { CONTACT, PAGES, PHOTOS, TEAM, decorateAgent } from "@/data/rr-data";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";
import Success from "@/components/Success";
import Photo from "@/components/Photo";

const SERVICES: [string, string][] = [
  ["Marketing and leasing", "Professional photos, listing on the major portals and our site, open times run by our leasing officer, and applications screened within 48 hours."],
  ["Tenant selection", "Identity, income, rental history and reference checks on every adult applicant. We recommend; you approve."],
  ["Rent and arrears", "Rent collected to trust, disbursed monthly with a statement. Arrears followed up from day one under a set procedure."],
  ["Inspections and reports", "Entry, routine (up to four a year) and exit inspections with photo reports you can read on your phone."],
  ["Maintenance", "Tenant requests logged online, quotes from licensed trades, approvals within your spending limit, and emergency cover after hours."],
  ["Compliance and renewals", "Smoke alarm, pool safety and minimum housing standards tracked. Lease renewals and rent reviews proposed before they fall due."],
];
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");

export default function PMClient() {
  const [value, setValue] = useState(850000);
  const [rent, setRent] = useState(650);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const annual = rent * 52;
  const y = (annual / value) * 100;
  const pmTeam = TEAM.filter((t) => ["Property Management", "Leasing", "Inspections"].includes(t.dept));

  return (
    <main>
      <section className="section--ink">
        <div className="pm-hero">
          <div className="pm-hero__text">
            <Crumb tone="light" items={[["Property management"]]} />
            <Lines as="h1" className="display-xl" style={{ fontSize: "clamp(2.6rem,1.1rem + 4.6vw,5.6rem)" }} lines={["Your investment,", "looked after properly."]} />
            <p style={{ maxWidth: "52ch", fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.5, color: "var(--grey-light)", fontWeight: 500 }}>Ten of our nineteen people work in property management, leasing and inspections, led by Senior Property Managers Frances Fernandez and Teresa Stewart. Close tenant vetting, regular inspections and plain reporting.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <a data-mag href="#rental-appraisal" className="pill pill--white pill--arrow"><span>Free rental appraisal</span><span className="pill__arrow" aria-hidden="true">→</span></a>
              <a href={CONTACT.phoneHref} className="pill pill--ghost-light">{CONTACT.phone}</a>
            </div>
          </div>
          <div data-reveal="clip" className="pm-hero__img">
            <div style={{ position: "absolute", inset: 0 }}><Photo src={PHOTOS.hero.pm} sizes="(max-width: 980px) 100vw, 50vw" priority quality={75} /></div>
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(22,24,29,.6) 0%,rgba(22,24,29,0) 40%)" }} />
          </div>
        </div>
      </section>

      <section className="section--white" style={{ padding: "clamp(48px,5vw,72px) var(--pad-x)", borderBottom: "1px solid rgba(17,19,24,.1)" }}>
        <div data-stagger className="proof-light">
          <div data-glow style={{ display: "grid", gap: 6 }}><div className="proof-light__n">10</div><div className="proof-light__k">People in PM, leasing and inspections</div></div>
          <div data-glow style={{ display: "grid", gap: 6 }}><div className="proof-light__n">4×</div><div className="proof-light__k">Routine inspections a year, with photo reports</div></div>
          <div data-glow style={{ display: "grid", gap: 6 }}><div className="proof-light__n">4.9</div><div className="proof-light__k">Agency rating on RateMyAgent</div></div>
          <div data-glow style={{ display: "grid", gap: 6 }}><div className="proof-light__n">You</div><div className="proof-light__k">Approve every tenant. Always.</div></div>
        </div>
      </section>

      <section className="section section--bg">
        <div className="sec-head" style={{ marginBottom: 48 }}>
          <div className="sec-head__text" style={{ maxWidth: 720 }}><div className="kicker">What&apos;s included</div><Lines className="h2" lines={["Everything between", "the lease and the ledger."]} /></div>
        </div>
        <div data-stagger className="tiles">
          {SERVICES.map(([title, body], i) => (
            <div key={title} data-glow="card" data-tilt="lift" className="tile"><div data-glow-n style={{ width: "max-content" }} className="tile__n">0{i + 1}</div><h3 className="tile__title">{title}</h3><p className="tile__body">{body}</p></div>
          ))}
        </div>
      </section>

      <section className="section section--dark">
        <div className="cols2" style={{ alignItems: "center" }}>
          <div style={{ display: "grid", gap: 22 }}>
            <div className="kicker">Rental yield</div>
            <Lines className="h2" lines={["What could your", "property return?"]} />
            <p data-reveal className="lead lead--light" style={{ maxWidth: "46ch" }}>A quick gross yield estimate. Move the sliders, then request a rental appraisal for a figure based on comparable leases in your suburb.</p>
            <div data-reveal style={{ display: "grid", gap: 24, paddingTop: 8 }}>
              <label className="range"><span><span>Property value</span><span>{money(value)}</span></span><input type="range" min={400000} max={2000000} step={10000} value={value} onChange={(e) => setValue(Number(e.target.value))} /></label>
              <label className="range"><span><span>Weekly rent</span><span>{money(rent)} pw</span></span><input type="range" min={300} max={1500} step={10} value={rent} onChange={(e) => setRent(Number(e.target.value))} /></label>
            </div>
          </div>
          <div data-reveal className="yield">
            <div style={{ display: "grid", gap: 6 }}><div className="yield__k">Gross yield</div><div className="yield__n">{y.toFixed(1)}%</div></div>
            <div className="yield__row">
              <div style={{ display: "grid", gap: 4 }}><div className="yield__k" style={{ fontSize: 12 }}>Annual rent</div><div style={{ fontSize: "clamp(1.3rem,1rem + 1vw,1.8rem)", fontWeight: 800, letterSpacing: "-.02em" }}>{money(annual)}</div></div>
              <div style={{ display: "grid", gap: 4 }}><div className="yield__k" style={{ fontSize: 12 }}>Monthly rent</div><div style={{ fontSize: "clamp(1.3rem,1rem + 1vw,1.8rem)", fontWeight: 800, letterSpacing: "-.02em" }}>{money(annual / 12)}</div></div>
            </div>
            <a data-mag href="#rental-appraisal" className="pill pill--white" style={{ justifyContent: "center" }}>Get an accurate rental appraisal</a>
            <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--grey-3)" }}>Gross yield excludes rates, insurance, maintenance, vacancy and management fees. For guidance only.</div>
          </div>
        </div>
      </section>

      <section className="section--white" style={{ padding: "var(--sec-y) 0", overflow: "hidden" }}>
        <div className="sec-head px">
          <div className="sec-head__text"><div className="kicker">The team</div><Lines className="h2" lines={["Who looks after your property."]} /></div>
          <Link href={PAGES.team} className="pill pill--dark" style={{ flex: "none" }}>Full team</Link>
        </div>
        <div className="strip">
          {pmTeam.map((t) => {
            const a = decorateAgent(t);
            return (
              <Link key={t.slug} data-card href={a.teamHref} className="card" style={{ width: "min(240px,66vw)" }}>
                <div className="card__media" style={{ aspectRatio: "3/4", background: "#d6d9df" }}><div data-zoom className="card__img card__img--top" style={{ backgroundImage: t.photo ? undefined : a.bgImage }}>{t.photo ? <Photo src={t.photo} sizes="(max-width: 720px) 66vw, 240px" position="center top" /> : null}</div></div>
                <div className="card__body" style={{ gap: 2 }}><div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.01em" }}>{t.name}</div><div style={{ fontSize: 13, color: "var(--grey)" }}>{t.role}</div></div>
              </Link>
            );
          })}
          <div className="strip-end" aria-hidden="true" />
        </div>
      </section>

      <section id="rental-appraisal" className="section section--bg" style={{ scrollMarginTop: 100 }}>
        <div className="cols2">
          <div className="sticky" style={{ display: "grid", gap: 22 }}>
            <div className="kicker">Rental appraisal</div>
            <Lines className="h2" lines={["Find out what", "your property could rent for."]} />
            <p data-reveal className="lead" style={{ maxWidth: "46ch" }}>A senior property manager reviews comparable leases, visits if you&apos;d like, and sends a written rental range with a management proposal. No cost, no obligation.</p>
            <blockquote data-reveal style={{ margin: 0, padding: "24px 0 0", borderTop: "1px solid rgba(17,19,24,.14)", display: "grid", gap: 10 }}><p style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.01em", lineHeight: 1.4 }}>&quot;Found tenants when another agent could not. Careful vetting and a thorough inventory.&quot;</p><footer style={{ fontSize: 13, fontWeight: 700, color: "var(--grey)", textTransform: "uppercase", letterSpacing: ".08em" }}>Jan · landlord</footer></blockquote>
          </div>
          {!sent ? (
            <form data-reveal className="light-form" onSubmit={(e) => { e.preventDefault(); setName(String(new FormData(e.currentTarget).get("name") || "there").split(" ")[0]); setSent(true); }}>
              <label className="field field--dark" style={{ color: "var(--grey)" }}>Property address<input name="address" required autoComplete="street-address" className="input input--md" /></label>
              <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,140px),1fr))" }}>
                <label className="field field--dark" style={{ color: "var(--grey)" }}>Type<select name="type" className="input input--md"><option>House</option><option>Townhouse</option><option>Unit</option></select></label>
                <label className="field field--dark" style={{ color: "var(--grey)" }}>Beds<select name="beds" defaultValue="3" className="input input--md">{["1", "2", "3", "4", "5+"].map((o) => <option key={o}>{o}</option>)}</select></label>
                <label className="field field--dark" style={{ color: "var(--grey)" }}>Status<select name="status" className="input input--md"><option>Vacant</option><option>Tenanted · changing agent</option><option>Owner occupied</option></select></label>
              </div>
              <div className="form-grid">
                <label className="field field--dark" style={{ color: "var(--grey)" }}>Your name<input name="name" required autoComplete="name" className="input input--md" /></label>
                <label className="field field--dark" style={{ color: "var(--grey)" }}>Phone<input name="phone" type="tel" required autoComplete="tel" className="input input--md" /></label>
              </div>
              <label className="field field--dark" style={{ color: "var(--grey)" }}>Email<input name="email" type="email" required autoComplete="email" className="input input--md" /></label>
              <button type="submit" className="pill pill--red" style={{ justifyContent: "center" }}>Request rental appraisal</button>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--grey)" }}>We reply within one business day. By sending you agree to our <a href="https://redrocketrealty.com.au/privacy-policy/" target="_blank" rel="noopener" style={{ color: "var(--ink)", fontWeight: 700 }}>Privacy Policy</a>.</div>
            </form>
          ) : (
            <div className="light-form" style={{ padding: "clamp(24px,3vw,40px)" }}>
              <Success title="Request received." onReset={() => setSent(false)}>Thanks, {name}. Frances or Teresa will call to arrange a time and send your written rental range.</Success>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
