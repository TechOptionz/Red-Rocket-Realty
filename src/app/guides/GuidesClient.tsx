"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BUYER_TIPS, LAND, PAGES, PHOTOS, SALE, SELLER_TIPS } from "@/data/rr-data";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";
import Success from "@/components/Success";
import Photo from "@/components/Photo";

export default function GuidesClient() {
  const sp = useSearchParams();
  const [guide, setGuide] = useState<"buyer" | "seller">(sp.get("guide") === "seller" ? "seller" : "buyer");
  const [active, setActive] = useState("");
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");

  // Footer/menu links such as "Seller guide" or "Make an offer" (?guide=buyer#offer) only change the query string, which does not
  // remount this component: follow the URL, then scroll to the hash once the right guide's sections exist.
  useEffect(() => {
    const g = sp.get("guide") === "seller" ? "seller" : "buyer";
    setGuide(g);
    setActive("");
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const raf = requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(raf);
  }, [sp]);

  useEffect(() => {
    const onScroll = () => {
      const arts = Array.from(document.querySelectorAll<HTMLElement>("article.tip"));
      let cur = "";
      arts.forEach((a) => { if (a.getBoundingClientRect().top < window.innerHeight * 0.45) cur = a.id; });
      if (!cur && arts[0]) cur = arts[0].id;
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [guide]);

  const b = guide === "buyer";
  const set = (g: "buyer" | "seller") => { setGuide(g); setActive(""); try { history.replaceState(null, "", "?guide=" + g); } catch {} window.scrollTo({ top: 0, behavior: "smooth" }); };
  const tips = (b ? BUYER_TIPS : SELLER_TIPS).map(([title, body], i) => ({ id: "tip-" + (i + 1), n: "0" + (i + 1), title, body }));
  const listings = [...SALE, ...LAND];

  return (
    <main>
      <section className="hero hero--page" style={{ minHeight: "80svh" }}>
        <div className="bsr__bg" aria-hidden="true"><Photo src={PHOTOS.hero.guides} sizes="100vw" priority quality={75} /></div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__body">
        <Crumb tone="light" items={[[b ? "Buyer guide" : "Seller guide"]]} />
        <div className="stack-m" style={{ flexWrap: "wrap", gap: 32, alignItems: "flex-end" }}>
          <div style={{ display: "grid", gap: 20, maxWidth: 900 }}>
            <div className="kicker kicker--photo">Guides</div>
            <Lines key={guide} as="h1" className="display-xl" style={{ fontSize: "clamp(2.6rem,1.4rem + 5vw,6.4rem)", letterSpacing: "-.035em", lineHeight: .96 }} lines={b ? ["Buying a home", <>in Logan, <span style={{ color: "var(--brand-red)" }}>step by step.</span></>] : ["Selling your home", <>for the <span style={{ color: "var(--brand-red)" }}>best price.</span></>]} />
            <p className="hero__sub">{b ? "Six things to settle before you make an offer, from the deposit to the inspection, written by the people who sell here every week." : "Five things that move the price, from research and repairs to presentation and promotion."}</p>
          </div>
          <div role="tablist" aria-label="Guide" className="seg">
            <button type="button" role="tab" className="seg__btn" style={{ padding: "0 20px" }} data-on={b ? "1" : "0"} onClick={() => set("buyer")}>For buyers</button>
            <button type="button" role="tab" className="seg__btn" style={{ padding: "0 20px" }} data-on={b ? "0" : "1"} onClick={() => set("seller")}>For sellers</button>
          </div>
        </div>
        </div>
      </section>

      <section className="section--white" style={{ padding: "clamp(56px,7vw,96px) var(--pad-x)", overflowX: "clip" }}>
        <div className="guide-cols">
          <nav className="toc" aria-label="On this page">
            <div className="kicker kicker--muted" style={{ letterSpacing: ".14em", padding: "0 0 12px" }}>On this page</div>
            {tips.map((t) => <a key={t.id} href={"#" + t.id} data-active={active === t.id ? "1" : "0"}>{t.n} &nbsp; {t.title}</a>)}
            <div className="rule" />
            {b && <a href="#offer" style={{ borderTop: 0 }}>07 &nbsp; Make an offer</a>}
          </nav>
          <div style={{ display: "grid", gap: "clamp(40px,5vw,64px)", minWidth: 0, maxWidth: "100%", gridTemplateColumns: "minmax(0,1fr)" }}>
            {tips.map((t, i) => (
              <article key={guide + t.id} data-reveal id={t.id} className="tip" data-active={active === t.id || (!active && i === 0) ? "1" : "0"}>
                <div className="tip__n">{t.n}</div>
                <div style={{ display: "grid", gap: 12 }}><div className="tip__rule" aria-hidden="true"><span /></div><h2>{t.title}</h2><p>{t.body}</p></div>
              </article>
            ))}
            {b ? (
              <article id="offer" className="offer">
                <div style={{ display: "grid", gap: 10 }}><div className="kicker">Expression of interest</div><h2 className="h3" style={{ fontSize: "clamp(1.6rem,1.1rem + 1.6vw,2.6rem)", letterSpacing: "-.025em", lineHeight: 1.08 }}>Ready to make an offer?</h2><p className="body body--light" style={{ maxWidth: "60ch" }}>Submit a written offer online with your price, deposit, finance and settlement terms. The listing agent presents it to the seller and comes back to you.</p></div>
                {!sent ? (
                  <form style={{ display: "grid", gap: 12 }} onSubmit={(e) => { e.preventDefault(); setName(String(new FormData(e.currentTarget).get("name") || "there").split(" ")[0]); setSent(true); }}>
                    <label className="field field--dark">Property<select name="property" required defaultValue="" className="input input--dark"><option value="">Choose a current listing</option>{listings.map((l) => <option key={l.id} value={l.id}>{l.address}, {l.suburb} · {l.price}</option>)}</select></label>
                    <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))" }}>
                      <label className="field field--dark">Offer price<input name="price" required inputMode="numeric" placeholder="$" className="input input--dark" /></label>
                      <label className="field field--dark">Deposit<input name="deposit" inputMode="numeric" placeholder="$" className="input input--dark" /></label>
                      <label className="field field--dark">Finance<select name="finance" className="input input--dark"><option>Subject to finance · 14 days</option><option>Subject to finance · 21 days</option><option>Cash · unconditional</option></select></label>
                      <label className="field field--dark">Settlement<select name="settlement" className="input input--dark"><option>30 days</option><option>45 days</option><option>60 days</option><option>Other · see notes</option></select></label>
                    </div>
                    <div className="form-grid">
                      <label className="field field--dark">Full name<input name="name" required autoComplete="name" className="input input--dark" /></label>
                      <label className="field field--dark">Phone<input name="phone" type="tel" required autoComplete="tel" className="input input--dark" /></label>
                      <label className="field field--dark">Email<input name="email" type="email" required autoComplete="email" className="input input--dark" /></label>
                    </div>
                    <label className="field field--dark">Conditions and notes <span className="opt">(optional)</span><textarea name="notes" rows={3} placeholder="Building and pest, inclusions, anything the seller should know." className="input input--dark" /></label>
                    <label className="check check--light"><input type="checkbox" required />I understand this is an expression of interest, not a binding contract, and the agent will contact me to formalise the offer.</label>
                    <button type="submit" className="pill pill--red" style={{ justifySelf: "start", padding: "0 28px" }}>Submit expression of interest</button>
                  </form>
                ) : (
                  <Success title="Offer received." light onReset={() => setSent(false)} resetLabel="Submit another">Thanks, {name}. The listing agent will call you to confirm the details before presenting it to the seller.</Success>
                )}
              </article>
            ) : (
              <div className="eoi" style={{ background: "var(--ink-2)", color: "#fff", borderRadius: 24 }}>
                <div style={{ display: "grid", gap: 6 }}><div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.01em" }}>Start with the price.</div><div style={{ fontSize: 14, color: "var(--grey-light)" }}>A free appraisal gives you a realistic range from recent comparable sales.</div></div>
                <Link href={PAGES.appraisal} className="pill pill--white pill--arrow"><span>Request an appraisal</span><span className="pill__arrow" aria-hidden="true">→</span></Link>
              </div>
            )}
            <p className="mono-note">Guide text from the current Tips for Buyers and Tips for Sellers pages, lightly edited · deposit and LMI figures to be reviewed against current lender policy</p>
          </div>
        </div>
      </section>
    </main>
  );
}
