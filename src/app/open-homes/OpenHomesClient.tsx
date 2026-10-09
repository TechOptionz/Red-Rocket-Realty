"use client";
import { useState } from "react";
import Link from "next/link";
import { CONTACT, LAND, PAGES, PHOTOS, RENT, SALE, decorate, formatRent, propHref, specs } from "@/data/rr-data";
import { icsEvent, icsFile } from "@/lib/ics";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";
import Photo from "@/components/Photo";

const ORDER = ["Wed 8 Oct", "Thu 8 Oct", "Thu 9 Oct", "Sat 10 Oct", "Sat 11 Oct", "Wed 15 Oct"];
const TIPS: [string, string][] = [
  ["Bring photo ID", "Attendees are registered at the door for the owner's security. A licence or passport is fine."],
  ["Check the catchment", "School catchments change at suburb edges. Ask the agent or look it up before you fall for the kitchen."],
  ["Ask for comparable sales", "We'll share recent sales in the street and suburb so your offer is grounded in the market."],
  ["Line up your inspector", "Have a QBCC-licensed building and pest inspector ready so you can act quickly once you've found the one."],
];

export default function OpenHomesClient() {
  const [mode, setMode] = useState<"all" | "buy" | "rent">("all");
  const src = [...(mode !== "rent" ? [...SALE, ...LAND] : []), ...(mode !== "buy" ? RENT : [])];
  const items = src.filter((p) => p.inspection).map((p) => {
    const [day, time] = p.inspection!.split(" · ");
    return { p, day, time, isRent: !!p.rent, ev: icsEvent(p, p.inspection!) };
  });
  const dayKeys = Array.from(new Set(items.map((i) => i.day))).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  const days = dayKeys.map((day) => ({ day, items: items.filter((i) => i.day === day).sort((a, b) => a.time.localeCompare(b.time)) }));

  return (
    <main>
      <section className="hero hero--page" style={{ minHeight: "72svh" }}>
        <div className="bsr__bg" aria-hidden="true"><Photo src={PHOTOS.hero.openHomes} sizes="100vw" priority quality={75} /></div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__body">
        <Crumb tone="light" items={[["Buy", PAGES.listings + "?mode=buy"], ["Open homes"]]} />
        <div className="stack-m" style={{ flexWrap: "wrap", gap: 32, alignItems: "flex-end" }}>
          <div style={{ display: "grid", gap: 20, maxWidth: 900 }}>
            <Lines as="h1" className="display-xl" style={{ fontSize: "clamp(2.6rem,1.4rem + 5vw,6.4rem)", letterSpacing: "-.035em", lineHeight: .96 }} lines={["Open homes", <><span style={{ color: "var(--brand-red)" }}>this week.</span></>]} />
            <p className="hero__sub">Every published inspection for sales and rentals, grouped by day. Add one to your calendar or plan a route for Saturday.</p>
          </div>
          <div role="tablist" aria-label="Listing type" className="seg">
            {([["all", "All"], ["buy", "For sale"], ["rent", "For rent"]] as const).map(([v, l]) => <button key={v} type="button" role="tab" className="seg__btn" data-on={mode === v ? "1" : "0"} onClick={() => setMode(v)}>{l}</button>)}
          </div>
        </div>
        </div>
      </section>

      <section className="hero-bar">
        <div className="oh-bar" style={{ paddingTop: 24 }}>
          <span><b style={{ color: "var(--ink)", fontWeight: 800 }}>{items.length}</b> inspections across {days.length} days</span>
          <a href={icsFile(items.map((i) => i.ev), "Open homes")} download="red-rocket-open-homes.ics" className="pill pill--ghost pill--sm">Add all to calendar ↓</a>
        </div>
      </section>

      <section className="section--bg" style={{ padding: "16px var(--pad-x) var(--sec-y)" }}>
        {days.length > 0 ? days.map((d) => (
          <div key={d.day} className="oh-day">
            <div className="oh-day__head"><h2>{d.day}</h2><span className="oh-day__count">{d.items.length} {d.items.length === 1 ? "inspection" : "inspections"}</span></div>
            {d.items.map((i, k) => {
              const dec = decorate(i.p);
              return (
                <Link key={i.p.id} href={propHref(i.p)} className="oh-row" style={{ animationDelay: Math.min(k, 6) * 0.06 + "s" }}>
                  <div className="oh-row__thumb"><div data-zoom className="card__img" style={{ backgroundColor: i.p.shade, backgroundImage: i.p.photo ? undefined : dec.bgImage }}>{i.p.photo ? <Photo src={i.p.photo} sizes="(max-width: 720px) 100vw, 180px" /> : null}</div>{i.p.status ? <span className="tag" style={{ padding: "6px 10px", fontSize: 10 }}>{i.p.status}</span> : null}</div>
                  <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}><span className="oh-row__time">{i.time}</span><span className="oh-row__kind" style={{ background: i.isRent ? "var(--ink)" : "var(--brand-red)" }}>{i.isRent ? "For rent" : "For sale"}</span></div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{i.p.address}, {i.p.suburb}</div>
                    <div className="card__specs" style={{ marginTop: 0 }}>{specs(i.p).join(" · ")} · {i.isRent ? formatRent(i.p.rent!) : i.p.price}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <a href={icsFile([i.ev])} download={"inspection-" + i.p.id + ".ics"} onClick={(e) => e.stopPropagation()} aria-label="Add to calendar" className="circle-btn circle-btn--sm">↓</a>
                    <span data-arrow aria-hidden="true" className="circle-btn circle-btn--sm" style={{ background: "#fff", borderColor: "rgba(17,19,24,.08)" }}>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )) : (
          <div className="empty">
            <div className="empty__title">No open homes published for this filter.</div>
            <p className="body" style={{ lineHeight: 1.55 }}>Private inspections can be arranged any day. Call the office or set a property alert and we&apos;ll email new times as they&apos;re published.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}><a href={CONTACT.phoneHref} className="pill pill--dark pill--md">Call {CONTACT.phone}</a><Link href={PAGES.listings + "?mode=buy#alerts"} className="pill pill--ghost pill--md">Set a property alert</Link></div>
          </div>
        )}
        <p className="mono-note" style={{ marginTop: 40 }}>Sale inspection times read from redrocketrealty.com.au on 7 Oct 2026 · rental inspection times to confirm from the rentals feed</p>
      </section>

      <section className="section section--white">
        <div className="sec-head">
          <div className="sec-head__text"><div className="kicker">Before you go</div><Lines className="h2" lines={["Get more from an open home."]} /></div>
          <Link href={PAGES.guides + "?guide=buyer"} className="pill pill--dark" style={{ flex: "none" }}>Full buyer guide</Link>
        </div>
        <div className="tips4">
          {TIPS.map(([t, b], i) => (<div key={t} data-reveal style={{ transitionDelay: i * 0.1 + "s" }}><b>0{i + 1}</b><h3>{t}</h3><p>{b}</p></div>))}
        </div>
      </section>
    </main>
  );
}
