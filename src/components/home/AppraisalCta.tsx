"use client";
import Link from "next/link";
import { CONTACT, PAGES, PHOTOS } from "@/data/rr-data";
import Lines from "@/components/Lines";
import Photo from "@/components/Photo";

export type ApprState = { step: 0 | 1 | 2; addr: string; kind: string };

export default function AppraisalCta({ state, setState }: { state: ApprState; setState: (s: ApprState) => void }) {
  return (
    <section id="appraisal" className="appr">
      <div data-reveal="clip" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", inset: 0 }}><Photo src={PHOTOS.limeTwilight} sizes="100vw" /></div>
      </div>
      <div className="appr__shade" aria-hidden="true" />
      <div className="appr__body">
        <div className="kicker kicker--photo">Thinking of selling or leasing?</div>
        <Lines className="display-xl" style={{ fontSize: "clamp(2.6rem,1.2rem + 5vw,6rem)", letterSpacing: "-.035em" }} lines={["How much is my", "property worth?"]} />
        <p data-reveal style={{ fontSize: 18, lineHeight: 1.5, color: "var(--grey-4)", maxWidth: "46ch" }}>Connecting you with your area expert. Free, with no obligation, for homes you want to sell or lease.</p>
        {state.step === 0 && (
          <form data-reveal className="input-row" style={{ maxWidth: 720, transitionDelay: ".1s" }} onSubmit={(e) => { e.preventDefault(); setState({ step: 1, addr: String(new FormData(e.currentTarget).get("address") || ""), kind: "" }); }}>
            <label htmlFor="appr-addr" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Property address</label>
            <input id="appr-addr" name="address" required placeholder="Property address" autoComplete="street-address" />
            <button type="submit">Request an appraisal</button>
          </form>
        )}
        {state.step === 1 && (
          <div className="appr__card">
            <div className="kicker kicker--muted" style={{ letterSpacing: ".14em" }}>Step 1 of 7 · {state.addr}</div>
            <div className="h4">Are you selling or leasing this property?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button type="button" className="pill pill--dark" onClick={() => setState({ ...state, step: 2, kind: "Selling your home" })}>Selling your home</button>
              <button type="button" className="pill pill--ghost" onClick={() => setState({ ...state, step: 2, kind: "Leasing your home" })}>Leasing your home</button>
            </div>
          </div>
        )}
        {state.step === 2 && (
          <div className="appr__card" style={{ gap: 16 }}>
            <div className="kicker kicker--muted" style={{ letterSpacing: ".14em" }}>{state.kind} · {state.addr}</div>
            <div className="h4">Steps 2–7 continue on the appraisal page.</div>
            <p className="body" style={{ fontSize: 15, lineHeight: 1.55 }}>Property type, bedrooms, expected price range, timing, a short description and your details.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <Link href={PAGES.appraisal} className="pill pill--red pill--md">Continue</Link>
              <button type="button" className="pill pill--link pill--md" onClick={() => setState({ step: 0, addr: "", kind: "" })}>Start over</button>
            </div>
          </div>
        )}
        <div data-reveal style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 24px", fontSize: 14, fontWeight: 700, color: "var(--grey-light)", transitionDelay: ".2s" }}>
          Take off with our team: <a href={CONTACT.phoneHref} style={{ color: "#fff", textDecoration: "none" }}>call {CONTACT.phone}</a> or <a href={"mailto:" + CONTACT.email} style={{ color: "#fff", textDecoration: "none" }}>email us today</a>
        </div>
      </div>
    </section>
  );
}
