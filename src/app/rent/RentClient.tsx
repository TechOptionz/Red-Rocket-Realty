"use client";
import { useState } from "react";
import Link from "next/link";
import { CONTACT, PAGES, PHOTOS, RENT } from "@/data/rr-data";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";
import PropertyCard from "@/components/PropertyCard";
import Success from "@/components/Success";

const STEPS: [string, string][] = [
  ["Inspect", "Attend a published open time or book a private viewing with the leasing officer. Bring photo ID."],
  ["Apply", "Complete the RTA Form 22 for every adult. Attach ID (100 points), proof of income and rental history or references."],
  ["Approval", "We check references and present your application to the owner. You hear back within two business days of a complete application."],
  ["Sign and move in", "Sign the General Tenancy Agreement, pay bond (lodged with the RTA) and two weeks rent, then collect the keys and the entry condition report."],
];
const FAQS: [string, string][] = [
  ["How do I pay rent?", "Rent is paid fortnightly or monthly by bank transfer to the trust account shown on your tenancy agreement, using your reference number. Keep rent at least one period in advance."],
  ["How often are routine inspections?", "Up to four times a year under Queensland law, with at least seven days written notice. We send a report with photos to the owner and a copy to you on request."],
  ["What counts as emergency maintenance?", "Burst water services, blocked or broken toilets, serious roof leaks, gas leaks, dangerous electrical faults, flooding, storm or fire damage, and failure of essential services. Call the office line; after hours follow the prompts."],
  ["Can I keep a pet?", "Ask before you apply. Many owners say yes with a pet clause in the agreement. Queensland rules require the owner to respond to a pet request within 14 days."],
  ["What happens when I move out?", "Give the notice period in your agreement (usually 14 days on a periodic tenancy). Clean to the entry condition report standard, return all keys, and we complete the exit report with you so the bond is refunded promptly."],
];

export default function RentClient() {
  const [open, setOpen] = useState(0);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  return (
    <main>
      <section className="hero" style={{ minHeight: "80svh" }}>
        <div className="bsr__bg" aria-hidden="true" style={{ backgroundImage: `url('${PHOTOS.hero.rent}')` }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,.1) 40%,rgba(15,17,20,.95) 100%)" }} />
        <div style={{ position: "relative", width: "100%", padding: "170px var(--pad-x) clamp(56px,7vw,96px)", display: "grid", gap: 28 }}>
          <Crumb tone="light" items={[["Rent"]]} />
          <div className="stack-m" style={{ flexWrap: "wrap", gap: 32 }}>
            <div style={{ display: "grid", gap: 20, maxWidth: 900 }}>
              <Lines as="h1" className="display-xl" style={{ fontSize: "clamp(2.6rem,1.1rem + 5vw,6rem)" }} lines={["Find a rental", "you'll be glad to call home."]} />
              <p className="hero__lead" style={{ animation: "none" }}>Houses and townhouses across Logan, managed by our largest team. Inspection times published, applications handled quickly.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Link data-mag href={PAGES.listings + "?mode=rent"} className="pill pill--white pill--arrow"><span>Browse rentals</span><span className="pill__arrow" aria-hidden="true">→</span></Link>
              <a href="#apply" className="pill pill--ghost-light">Apply</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section--bg" style={{ padding: "var(--sec-y) 0", overflow: "hidden" }}>
        <div className="sec-head px">
          <div className="sec-head__text"><div className="kicker">For rent</div><Lines className="h2" lines={["Available now and coming up."]} /></div>
          <Link href={PAGES.listings + "?mode=rent"} className="pill pill--dark" style={{ flex: "none" }}>All {RENT.length} rentals</Link>
        </div>
        <div className="strip">
          {RENT.map((p) => <PropertyCard key={p.id} p={p} width="min(380px,82vw)" showMeta addrFormat="suburb-type" />)}
          <div className="strip-end" aria-hidden="true" />
        </div>
        <p className="mono-note px" style={{ marginTop: 32 }}>Rental addresses and photos from the live site · weekly rent, specs and inspection times to confirm from the rentals feed</p>
      </section>

      <section id="apply" className="section section--white" style={{ scrollMarginTop: 100 }}>
        <div className="cols2" style={{ gridTemplateColumns: "1fr 1.2fr" }}>
          <div className="sticky" style={{ display: "grid", gap: 22 }}>
            <div className="kicker">Applying</div>
            <Lines className="h2" lines={["Four steps", "to the keys."]} />
            <p data-reveal className="lead" style={{ maxWidth: "44ch" }}>Applications use the Queensland RTA Form 22. Download it, complete it and return it to the office with your documents.</p>
            <div data-reveal style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <a data-mag href={CONTACT.form22} target="_blank" rel="noopener" className="pill pill--red pill--arrow"><span>Download application form</span><span className="pill__arrow" aria-hidden="true">↓</span></a>
              <a href={"mailto:" + CONTACT.leasing} className="pill pill--ghost">Email leasing</a>
            </div>
          </div>
          <div data-stagger style={{ display: "grid" }}>
            {STEPS.map(([title, body], i) => (
              <div key={title} data-glow="row" className="numbered"><div data-glow-n className="numbered__n">0{i + 1}</div><div style={{ display: "grid", gap: 10 }}><h3 data-glow-t className="numbered__title">{title}</h3><p className="numbered__body">{body}</p></div></div>
            ))}
            <div className="rule" />
          </div>
        </div>
      </section>

      <section id="tenants" className="section section--bg" style={{ scrollMarginTop: 100 }}>
        <div className="cols2" style={{ gridTemplateColumns: "1fr 1.2fr" }}>
          <div className="sticky" style={{ display: "grid", gap: 22 }}>
            <div className="kicker">Tenant information</div>
            <Lines className="h2" lines={["Once you're in."]} />
            <p data-reveal className="lead" style={{ maxWidth: "44ch" }}>Rent, inspections, maintenance and moving out. Your property manager is the first call for anything not covered here.</p>
          </div>
          <div style={{ display: "grid" }}>
            {FAQS.map(([q, a], i) => (
              <div key={q} className="faq" data-open={open === i ? "1" : "0"}>
                <button type="button" className="faq__btn" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span>{q}</span><span className="faq__plus" aria-hidden="true">+</span></button>
                <div className="faq__body"><div><p>{a}</p></div></div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid rgba(17,19,24,.14)" }} />
          </div>
        </div>
      </section>

      <section id="maintenance" className="section section--dark" style={{ scrollMarginTop: 100 }}>
        <div className="cols2" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
          <div style={{ display: "grid", gap: 22, minWidth: 0 }}>
            <div className="kicker">Maintenance request</div>
            <Lines className="h2" lines={["Something needs fixing?"]} />
            <p data-reveal className="lead lead--light" style={{ maxWidth: "46ch" }}>Tell us what and where, add a photo if you can, and your property manager will arrange a tradesperson. For emergencies after hours (burst pipes, no power, gas leaks, flooding) call the office line and follow the prompts.</p>
            <a data-reveal href={CONTACT.phoneHref} className="phone-big"><span aria-hidden="true" />{CONTACT.phone}</a>
          </div>
          {!sent ? (
            <form data-reveal className="dark-form" onSubmit={(e) => { e.preventDefault(); setName(String(new FormData(e.currentTarget).get("name") || "there").split(" ")[0]); setSent(true); }}>
              <div className="form-grid">
                <label className="field field--dark">Your name<input name="name" required autoComplete="name" className="input input--dark" /></label>
                <label className="field field--dark">Phone<input name="phone" type="tel" required autoComplete="tel" className="input input--dark" /></label>
              </div>
              <label className="field field--dark">Rental address<input name="address" required autoComplete="street-address" className="input input--dark" /></label>
              <div className="form-grid">
                <label className="field field--dark">Issue type<select name="type" className="input input--dark">{["Plumbing", "Electrical", "Appliance", "Doors, windows, locks", "Pests", "Garden or exterior", "Other"].map((o) => <option key={o}>{o}</option>)}</select></label>
                <label className="field field--dark">Urgency<select name="urgency" className="input input--dark">{["Routine", "Soon · affects daily use", "Urgent · safety or damage risk"].map((o) => <option key={o}>{o}</option>)}</select></label>
              </div>
              <label className="field field--dark">Describe the problem<textarea name="desc" required rows={4} placeholder="Where it is, what happens, when it started." className="input input--dark" /></label>
              <label className="field field--dark">Photos <span className="opt">(optional)</span><input name="photos" type="file" accept="image/*" multiple style={{ font: "500 14px var(--font)", color: "var(--grey-light)", maxWidth: "100%", minWidth: 0 }} /></label>
              <label className="check check--light"><input name="entry" type="checkbox" />A tradesperson may enter with the office key if I&apos;m not home (with the notice required by the RTA).</label>
              <button type="submit" className="pill pill--red" style={{ justifyContent: "center" }}>Send maintenance request</button>
            </form>
          ) : (
            <div className="dark-form" style={{ padding: "clamp(24px,3vw,40px)" }}>
              <Success title="Request logged." light onReset={() => setSent(false)} resetLabel="Log another">Thanks, {name}. Your property manager will confirm a time with you, usually within one business day for routine items.</Success>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
