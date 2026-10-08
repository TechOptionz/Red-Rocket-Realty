"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CONTACT, PAGES } from "@/data/rr-data";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";
import Success from "@/components/Success";

const OWNERS: Record<string, string> = { Selling: "the sales team", Buying: "the sales team", Renting: "the leasing team", "Property management": "the property management team", Maintenance: "your property manager", Other: "reception" };
const PH: Record<string, string> = { Selling: "e.g. Thinking of selling our 4-bed in Rochedale South next year.", Buying: "e.g. Looking for a 3-bed house in Underwood or Springwood under $900k.", Renting: "e.g. Can I arrange a private inspection for the Shailer Park rental?", "Property management": "e.g. Considering changing agents for my Woodridge unit.", Maintenance: "e.g. Hot water system not heating at ...", Other: "How can we help?" };

export default function ContactClient() {
  const sp = useSearchParams();
  const initial = sp.get("topic");
  const [topic, setTopic] = useState(initial && OWNERS[initial] ? initial : "Selling");
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const channels = [
    { k: "Sales", v: CONTACT.email, sub: "Buying, selling, appraisals and offers.", href: "mailto:" + CONTACT.email },
    { k: "Leasing", v: CONTACT.leasingPhone, sub: "Bhavani Vakity · inspections and applications.", href: "tel:+61439752326" },
    { k: "Inspections", v: CONTACT.inspections, sub: "Open homes, private viewings, routine inspections.", href: "mailto:" + CONTACT.inspections },
    { k: "Maintenance", v: "Log a request", sub: "Tenants: report repairs online, 24 hours.", href: PAGES.rent + "#maintenance" },
  ];
  return (
    <main>
      <section className="page-head page-head--pad">
        <Crumb items={[["Contact"]]} />
        <div className="cols2" style={{ gridTemplateColumns: "1.1fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "end" }}>
          <Lines as="h1" className="display-lg" lines={["Buying, selling or", "renting in Logan?"]} />
          <div style={{ display: "grid", gap: 8 }}>
            <a href={CONTACT.phoneHref} style={{ color: "var(--ink)", textDecoration: "none", fontSize: "clamp(1.6rem,1.2rem + 1.6vw,2.6rem)", fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1 }}>{CONTACT.phone}</a>
            <div style={{ fontSize: 15, color: "var(--grey-2)", lineHeight: 1.5 }}>67 Springwood Road, Springwood QLD 4127<br />Mon–Fri 9:00am–5:00pm · Sat by appointment <span className="mono-note" style={{ fontSize: 10 }}>hours to confirm</span></div>
          </div>
        </div>
      </section>

      <section className="section--bg" style={{ padding: "0 var(--pad-x) clamp(48px,6vw,80px)" }}>
        <div data-stagger className="channels">
          {channels.map((c) => {
            const inner = (<><div className="tile__k">{c.k}</div><div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.01em", wordBreak: "break-word" }}>{c.v}</div><div className="tile__sub">{c.sub}</div></>);
            return c.href.startsWith("/") ? <Link key={c.k} href={c.href} className="tile" style={{ padding: 24, gap: 8 }}>{inner}</Link> : <a key={c.k} href={c.href} className="tile" style={{ padding: 24, gap: 8 }}>{inner}</a>;
          })}
        </div>
      </section>

      <section className="section section--white">
        <div className="cols2">
          <div style={{ display: "grid", gap: 28 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <div className="kicker">Send a message</div>
              <Lines className="h2" style={{ fontSize: "clamp(1.8rem,1.1rem + 2.2vw,3rem)" }} lines={["Tell us what you need."]} />
              <p className="body" style={{ maxWidth: "50ch" }}>Pick a topic so it lands with the right person. We reply within one business day.</p>
            </div>
            {!sent ? (
              <form style={{ display: "grid", gap: 14 }} onSubmit={(e) => { e.preventDefault(); setName(String(new FormData(e.currentTarget).get("name") || "there").split(" ")[0]); setSent(true); }}>
                <div role="radiogroup" aria-label="Topic" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.keys(OWNERS).map((t) => <button key={t} type="button" role="radio" aria-checked={topic === t} className="chip chip--white" data-on={topic === t ? "1" : "0"} onClick={() => setTopic(t)}>{t}</button>)}
                </div>
                <div className="form-grid">
                  <label className="field field--dark" style={{ color: "var(--grey)" }}>Full name<input name="name" required autoComplete="name" className="input input--md" /></label>
                  <label className="field field--dark" style={{ color: "var(--grey)" }}>Phone<input name="phone" type="tel" autoComplete="tel" className="input input--md" /></label>
                </div>
                <label className="field field--dark" style={{ color: "var(--grey)" }}>Email<input name="email" type="email" required autoComplete="email" className="input input--md" /></label>
                <label className="field field--dark" style={{ color: "var(--grey)" }}>Message<textarea name="message" required rows={5} placeholder={PH[topic]} className="input input--md" /></label>
                <label className="check"><input type="checkbox" required />I agree to be contacted and have read the <a href="https://redrocketrealty.com.au/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a>.</label>
                <button type="submit" className="pill pill--red" style={{ justifySelf: "start", padding: "0 28px" }}>Send message</button>
              </form>
            ) : (
              <div style={{ padding: 32, borderRadius: 24, background: "var(--bg)" }}>
                <Success title="Message sent." onReset={() => setSent(false)}>Thanks, {name}. Your {topic.toLowerCase()} enquiry is with {OWNERS[topic]}.</Success>
              </div>
            )}
          </div>
          <div className="sticky" style={{ display: "grid", gap: 16 }}>
            <div data-reveal className="map" style={{ aspectRatio: "4/3", borderRadius: 20 }}>
              <iframe title="Map · 67 Springwood Road, Springwood" src="https://www.openstreetmap.org/export/embed.html?bbox=153.1245%2C-27.6195%2C153.1425%2C-27.6075&layer=mapnik&marker=-27.6135%2C153.1335" loading="lazy" />
              <a href="https://www.google.com/maps/dir/?api=1&destination=67+Springwood+Road+Springwood+QLD+4127" target="_blank" rel="noopener" className="pill pill--dark pill--sm map__btn">Get directions →</a>
            </div>
            <div data-reveal className="contact-info">
              <div style={{ display: "grid", gap: 4 }}><div className="contact-info__k">Office</div><div className="contact-info__v">67 Springwood Road<br />Springwood QLD 4127</div></div>
              <div style={{ display: "grid", gap: 4 }}><div className="contact-info__k">Parking</div><div className="contact-info__v">On site and street parking <span className="mono-note" style={{ fontSize: 10 }}>to confirm</span></div></div>
              <div style={{ display: "grid", gap: 4 }}><div className="contact-info__k">Follow</div><div style={{ display: "flex", gap: 8 }}><a href={CONTACT.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="social-dark">f</a><a href={CONTACT.instagram} target="_blank" rel="noopener" aria-label="Instagram" className="social-dark">ig</a><a href={CONTACT.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn" className="social-dark">in</a></div></div>
              <div style={{ display: "grid", gap: 4 }}><div className="contact-info__k">Reviews</div><a href={CONTACT.rma} target="_blank" rel="noopener" className="contact-info__v" style={{ color: "var(--ink)", textDecoration: "none" }}>4.9 ★ · 485 on RateMyAgent ↗</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
