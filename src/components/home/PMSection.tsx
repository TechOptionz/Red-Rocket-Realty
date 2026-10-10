"use client";
import { useState } from "react";
import { PHOTOS } from "@/data/rr-data";
import Lines from "@/components/Lines";
import Photo from "@/components/Photo";

const PANELS: [string, string][] = [
  ["Tenant selection", "Tenants are vetted closely on identity, income, rental history and references. We recommend; you approve every tenant."],
  ["Entry inventory", "A full entry condition report with detailed notes and photographs, so bond disputes are settled on evidence."],
  ["Involved at every step", "You hear about applications, arrears and repairs as they happen. Issues are followed up and fixed, not filed."],
  ["Flexible leases", "Short or unusual lease arrangements are accommodated when they suit you and the tenant."],
  ["Repairs any time", "Tenants log repairs 24 hours a day through Tapi, with an emergency option after hours."],
];

export default function PMSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="property-management" className="pm">
      <div className="pm__grid">
        <div data-reveal="clip" className="pm__img">
          <div data-drift="0.08" className="drift-bg"><Photo src={PHOTOS.hunterLounge} sizes="(max-width: 980px) 100vw, 50vw" position="center 70%" /></div>
        </div>
        <div className="pm__body">
          <div style={{ display: "grid", gap: 18 }}>
            <div className="kicker">Property management</div>
            <Lines className="h2" style={{ textWrap: "balance" }} lines={["Your investment,", "looked after by our largest team."]} />
            <p data-reveal className="lead lead--light" style={{ maxWidth: "50ch" }}>Ten of our nineteen people work in property management, leasing and inspections, led by Senior Property Managers Frances Fernandez and Teresa Stewart.</p>
          </div>
          <div data-reveal style={{ display: "grid", gap: 10 }}>
            {PANELS.map(([title, body], i) => (
              <div key={title} data-glow className="svc" data-open={open === i ? "1" : "0"} tabIndex={0} onMouseEnter={() => setOpen(i)} onClick={() => setOpen(i)} onFocus={() => setOpen(i)}>
                <div className="svc__head"><span data-glow-n style={{ display: "inline-block" }} className="svc__n">0{i + 1}</span><span className="svc__title">{title}</span></div>
                <div><p>{body}</p></div>
              </div>
            ))}
          </div>
          <div data-reveal style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="#appraisal" className="pill pill--red pill--arrow"><span>Request a rental appraisal</span><span className="pill__arrow" aria-hidden="true">→</span></a>
            <a href="tel:+61439752326" className="pill pill--ghost-light">Leasing · 0439 752 326</a>
          </div>
        </div>
      </div>
    </section>
  );
}
