"use client";
import { useState } from "react";
import { CONTACT } from "@/data/rr-data";
import Lines from "@/components/Lines";
import Success from "@/components/Success";

export default function ContactSection() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  return (
    <section id="contact" className="section section--bg">
      <div className="cols2">
        <div style={{ display: "grid", gap: 32 }}>
          <div style={{ display: "grid", gap: 18 }}>
            <div className="kicker">Mission control</div>
            <Lines className="h2" style={{ textWrap: "balance" }} lines={["Speak with our friendly team", "of local experts today!"]} />
          </div>
          <div data-reveal className="rows">
            <div className="row"><span className="row__k">Office</span><span className="row__v">67 Springwood Road, Springwood QLD 4127</span></div>
            <div className="row"><span className="row__k">Phone</span><span className="row__v"><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></span></div>
            <div className="row"><span className="row__k">Sales</span><span className="row__v" style={{ wordBreak: "break-all" }}><a href={"mailto:" + CONTACT.email}>{CONTACT.email}</a></span></div>
            <div className="row"><span className="row__k">Rentals</span><span className="row__v" style={{ wordBreak: "break-all" }}><a href={"mailto:" + CONTACT.inspections}>{CONTACT.inspections}</a></span></div>
            <div className="row"><span className="row__k">Leasing</span><span className="row__v" style={{ wordBreak: "break-all" }}><a href={"mailto:" + CONTACT.leasing}>{CONTACT.leasing}</a><span style={{ color: "var(--grey)", fontWeight: 500 }}> · {CONTACT.leasingPhone}</span></span></div>
            <div className="mono-note" style={{ paddingTop: 12 }}>Opening hours not published · confirm with the agency</div>
          </div>
          <div data-reveal="clip" className="map">
            <iframe title="Map · 67 Springwood Road, Springwood" src="https://www.openstreetmap.org/export/embed.html?bbox=153.1245%2C-27.6195%2C153.1425%2C-27.6075&layer=mapnik&marker=-27.6135%2C153.1335" loading="lazy" />
            <a href="https://www.openstreetmap.org/?mlat=-27.6135&mlon=153.1335#map=16/-27.6135/153.1335" target="_blank" rel="noopener" className="pill pill--dark pill--xs map__btn">Open map →</a>
          </div>
        </div>
        <div data-reveal className="contact-card" style={{ transitionDelay: ".1s" }}>
          {!sent ? (
            <form style={{ display: "grid", gap: 16 }} onSubmit={(e) => { e.preventDefault(); setName(String(new FormData(e.currentTarget).get("first") || "")); setSent(true); }}>
              <div className="h4" style={{ marginBottom: 8 }}>Send us a message</div>
              <div className="form-grid form-grid--16">
                <label className="field">First name<input name="first" required autoComplete="given-name" className="input" /></label>
                <label className="field">Last name<input name="last" required autoComplete="family-name" className="input" /></label>
              </div>
              <label className="field">Email<input name="email" type="email" required autoComplete="email" className="input" /></label>
              <label className="field">Phone <span className="opt">(optional)</span><input name="phone" type="tel" autoComplete="tel" className="input" /></label>
              <label className="field">Message<textarea name="message" required rows={4} className="input" /></label>
              <label className="check"><input type="checkbox" required /><span>I agree to Red Rocket Realty storing my details to respond to this enquiry, as described in the <a href="https://redrocketrealty.com.au/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>
              <button type="submit" className="pill pill--red" style={{ justifySelf: "start", padding: "0 28px" }}>Submit</button>
            </form>
          ) : (
            <Success title="Message received." onReset={() => setSent(false)} style={{ minHeight: 320, alignContent: "center" }}>
              Thanks, {name}. One of our local experts will be in touch. Need us sooner? Call <a href={CONTACT.phoneHref} style={{ color: "var(--ink)", fontWeight: 700 }}>{CONTACT.phone}</a>.
            </Success>
          )}
        </div>
      </div>
    </section>
  );
}
