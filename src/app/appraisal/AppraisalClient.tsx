"use client";
import { useState } from "react";
import Link from "next/link";
import { PAGES, SEARCH } from "@/data/rr-data";

const LABELS = ["Your situation", "Property type", "Rooms", "Location", "Timing", "Notes", "Your details"];
const INTENTS = [["Thinking of selling", "I want to know what my home is worth"], ["Ready to sell now", "I want to list in the next few weeks"], ["Investor", "Sale or rental appraisal for an investment property"], ["Just curious", "No plans yet, keep me informed"]];
const TYPES = ["House", "Townhouse", "Unit", "Land", "Acreage"];
const TIMINGS = ["As soon as possible", "Within 3 months", "3 to 6 months", "Just researching"];

export default function AppraisalClient() {
  const [step, setStep] = useState(1);
  const [v, setV] = useState({ intent: "", type: "", beds: "", baths: "", cars: "", address: "", suburb: "", timing: "", notes: "" });
  const [done, setDone] = useState(false);
  const [first, setFirst] = useState("");
  const total = 7;
  const pick = (k: keyof typeof v, val: string, advance?: boolean) => { setV({ ...v, [k]: val }); if (advance) setStep((s) => Math.min(total, s + 1)); };
  const choice = (k: keyof typeof v, val: string, children: React.ReactNode, advance?: boolean, cls = "choice") => (
    <button key={val} type="button" className={cls} data-on={v[k] === val ? "1" : "0"} onClick={() => pick(k, val, advance)}>{children}</button>
  );
  const s4ok = !!(v.address.trim() && v.suburb);

  return (
    <main className="section--dark">
      <section className="ap">
        <div className="ap__side">
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "url('https://redrocketrealty.com.au/wp-content/uploads/2026/10/4-Boskenne-Street-Rochedale-South-QLD-4123-13.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(15,17,20,.5) 0%,rgba(15,17,20,.2) 40%,rgba(15,17,20,.96) 100%)" }} />
          <div className="ap__side-body">
            <div className="kicker">Free market appraisal</div>
            <h1 className="display-lg" style={{ fontSize: "clamp(2.4rem,1.4rem + 3.4vw,4.8rem)", letterSpacing: "-.035em" }}>How much is your home worth?</h1>
            <p className="lead lead--light" style={{ lineHeight: 1.55, maxWidth: "46ch" }}>Seven quick questions. A local agent reviews recent comparable sales and calls you within one business day. No obligation, no cost.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.14)" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", background: "#2b2f37", backgroundImage: "url('https://redrocketrealty.com.au/wp-content/uploads/2020/05/parnam-singh-heir.jpg')", backgroundSize: "cover", backgroundPosition: "center top", flex: "none" }} />
              <div style={{ display: "grid", gap: 2 }}><div style={{ fontSize: 15, fontWeight: 800 }}>Parnam Singh Heir</div><div style={{ fontSize: 13, color: "var(--grey-light)" }}>Principal / Director · Agent of the Year, Underwood 2017 and 2019</div></div>
            </div>
          </div>
        </div>

        <div className="ap__form">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            <nav aria-label="Breadcrumb" className="crumb crumb--dim" style={{ marginBottom: 0 }}><Link href={PAGES.home}>Home</Link><span aria-hidden="true">/</span><Link href={PAGES.sell}>Sell</Link><span aria-hidden="true">/</span><span>Appraisal</span></nav>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--grey-3)" }}>{done ? "Request sent" : `Step ${step} of ${total} · ${LABELS[step - 1]}`}</div>
          </div>
          <div aria-hidden="true" className="ap__bar"><div style={{ width: (done ? 100 : Math.round(((step - 1) / total) * 100)) + "%" }} /></div>

          {!done && step === 1 && (
            <div key="s1" className="anim-in" style={{ display: "grid", gap: 24 }}>
              <h2 className="ap__q">Which best describes your situation?</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 12 }}>
                {INTENTS.map(([l, sub]) => choice("intent", l, <><b>{l}</b><small>{sub}</small></>, true))}
              </div>
            </div>
          )}
          {!done && step === 2 && (
            <div key="s2" className="anim-in" style={{ display: "grid", gap: 24 }}>
              <h2 className="ap__q">What type of property is it?</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,140px),1fr))", gap: 12 }}>
                {TYPES.map((t) => choice("type", t, t, true, "choice choice--center"))}
              </div>
            </div>
          )}
          {!done && step === 3 && (
            <div key="s3" className="anim-in" style={{ display: "grid", gap: 28 }}>
              <h2 className="ap__q">Tell us about the home.</h2>
              {([["Bedrooms", "beds", ["1", "2", "3", "4", "5", "6+"]], ["Bathrooms", "baths", ["1", "2", "3", "4+"]], ["Car spaces", "cars", ["0", "1", "2", "3+"]]] as [string, keyof typeof v, string[]][]).map(([label, k, opts]) => (
                <div key={k} style={{ display: "grid", gap: 10 }}>
                  <div className="kicker kicker--light" style={{ letterSpacing: ".12em" }}>{label}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{opts.map((o) => choice(k, o, o, false, "choice choice--pill"))}</div>
                </div>
              ))}
              <button type="button" className="pill pill--red" style={{ justifySelf: "start", padding: "0 28px" }} onClick={() => setStep(4)}>Continue</button>
            </div>
          )}
          {!done && step === 4 && (
            <div key="s4" className="anim-in" style={{ display: "grid", gap: 24 }}>
              <h2 className="ap__q">Where is the property?</h2>
              <label className="field field--dark">Street address<input value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} placeholder="e.g. 67 Springwood Road" autoComplete="street-address" className="input input--dark input--xl" /></label>
              <label className="field field--dark">Suburb<select value={v.suburb} onChange={(e) => setV({ ...v, suburb: e.target.value })} className="input input--dark input--xl"><option value="">Choose a suburb</option>{SEARCH.buySuburbs.map((o) => <option key={o} value={o}>{o}</option>)}<option value="Other">Other · tell us in the notes</option></select></label>
              <button type="button" className="pill pill--red" disabled={!s4ok} style={{ justifySelf: "start", padding: "0 28px", opacity: s4ok ? 1 : 0.5 }} onClick={() => setStep(5)}>Continue</button>
            </div>
          )}
          {!done && step === 5 && (
            <div key="s5" className="anim-in" style={{ display: "grid", gap: 24 }}>
              <h2 className="ap__q">When are you thinking of selling?</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 12 }}>
                {TIMINGS.map((t) => choice("timing", t, t, true, "choice choice--center"))}
              </div>
            </div>
          )}
          {!done && step === 6 && (
            <div key="s6" className="anim-in" style={{ display: "grid", gap: 24 }}>
              <h2 className="ap__q">Anything we should know?</h2>
              <p className="body body--light" style={{ fontSize: 15, lineHeight: 1.55 }}>Renovations, a granny flat, a pool, tenants in place, or what matters most to you about the sale. Optional.</p>
              <textarea value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} rows={4} placeholder="e.g. Renovated kitchen in 2024, currently tenanted until March." className="input input--dark" style={{ borderRadius: 14, padding: "16px 18px", fontSize: 16 }} />
              <button type="button" className="pill pill--red" style={{ justifySelf: "start", padding: "0 28px" }} onClick={() => setStep(7)}>Continue</button>
            </div>
          )}
          {!done && step === 7 && (
            <form key="s7" className="anim-in" style={{ display: "grid", gap: 20 }} onSubmit={(e) => { e.preventDefault(); const n = String(new FormData(e.currentTarget).get("name") || "").trim(); setFirst(n.split(" ")[0] || "there"); setDone(true); }}>
              <h2 className="ap__q">Where should we send the appraisal?</h2>
              <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))" }}>
                <label className="field field--dark">Full name<input name="name" required autoComplete="name" className="input input--dark" style={{ height: 56, borderRadius: 14, padding: "0 18px", fontSize: 16 }} /></label>
                <label className="field field--dark">Phone<input name="phone" type="tel" required autoComplete="tel" className="input input--dark" style={{ height: 56, borderRadius: 14, padding: "0 18px", fontSize: 16 }} /></label>
              </div>
              <label className="field field--dark">Email<input name="email" type="email" required autoComplete="email" className="input input--dark" style={{ height: 56, borderRadius: 14, padding: "0 18px", fontSize: 16 }} /></label>
              <label className="check check--light"><input type="checkbox" required />I agree to be contacted about this appraisal and have read the <a href="https://redrocketrealty.com.au/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a>.</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <button type="submit" className="pill pill--red pill--lg" style={{ padding: "0 30px" }}>Request my appraisal</button>
                <span style={{ fontSize: 13, color: "var(--grey-3)" }}>We reply within one business day.</span>
              </div>
            </form>
          )}
          {done && (
            <div className="anim-in" style={{ display: "grid", gap: 20 }}>
              <div className="success__tick">✓</div>
              <h2 className="ap__q" style={{ fontSize: "clamp(1.8rem,1.2rem + 2vw,3rem)" }}>Thanks, {first}. We&apos;re on it.</h2>
              <p className="body body--light" style={{ maxWidth: "52ch" }}>We’ve logged a {(v.type || "property").toLowerCase()}{v.beds ? " with " + v.beds + " bedrooms" : ""} at {v.address}, {v.suburb} ({(v.timing || "timing to be confirmed").toLowerCase()}). A local agent will call you within one business day to arrange a visit and talk through comparable sales.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Link href={PAGES.listings + "?mode=sold"} className="pill pill--white pill--md">See what&apos;s sold nearby</Link>
                <Link href={PAGES.guides + "?guide=seller"} className="pill pill--ghost-light pill--md">Read the seller guide</Link>
              </div>
            </div>
          )}
          {!done && step > 1 && <button type="button" className="ap__back" onClick={() => setStep((s) => Math.max(1, s - 1))}>← Back</button>}
        </div>
      </section>
    </main>
  );
}
