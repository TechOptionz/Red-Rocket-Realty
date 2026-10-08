"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CONTACT, DEPTS, LAND, PAGES, SALE, SOLD, TEAM, decorate, decorateAgent, propHref } from "@/data/rr-data";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";

export default function TeamClient() {
  const [dept, setDept] = useState("All");
  const [open, setOpen] = useState("");

  useEffect(() => {
    const id = decodeURIComponent((window.location.hash || "").slice(1));
    if (id && TEAM.some((t) => t.slug === id)) setOpen(id);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => { setOpen(""); try { history.replaceState(null, "", window.location.pathname + window.location.search); } catch {} };
  const show = (slug: string) => { setOpen(slug); try { history.replaceState(null, "", "#" + slug); } catch {} };
  const team = TEAM.filter((t) => dept === "All" || t.dept === dept);
  const o = TEAM.find((t) => t.slug === open);
  const listings = o ? [...SALE, ...LAND, ...SOLD].filter((p) => p.agent === o.name || p.agent2 === o.name).slice(0, 4) : [];

  return (
    <main>
      <section className="page-head">
        <Crumb items={[["About", PAGES.about], ["Our team"]]} />
        <div className="stack-m" style={{ flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 18, maxWidth: 820 }}>
            <Lines as="h1" className="display-lg" lines={["Nineteen locals.", "One team."]} />
            <p className="lead" style={{ maxWidth: "56ch" }}>Directors, sales agents, property managers, leasing and inspections, all working from 67 Springwood Road. Pick a department or browse everyone.</p>
          </div>
          <a href={CONTACT.phoneHref} className="pill pill--dark pill--arrow" style={{ flex: "none" }}><span>{CONTACT.phone}</span><span className="pill__arrow" aria-hidden="true" style={{ background: "var(--red)", color: "#fff" }}>→</span></a>
        </div>
        <div className="strip" role="tablist" aria-label="Department" style={{ gap: 8, padding: "40px 0 32px", borderBottom: "1px solid rgba(17,19,24,.12)" }}>
          {DEPTS.map((d) => (
            <button key={d} type="button" role="tab" className="chip chip--white" data-on={d === dept ? "1" : "0"} onClick={() => setDept(d)}>{d} <span style={{ fontWeight: 500, opacity: .7 }}>{d === "All" ? TEAM.length : TEAM.filter((t) => t.dept === d).length}</span></button>
          ))}
        </div>
      </section>

      <section className="section--bg" style={{ padding: "40px var(--pad-x) var(--sec-y)" }}>
        <div className="team-grid">
          {team.map((t, i) => {
            const a = decorateAgent(t);
            return (
              <a key={dept + t.slug} data-card id={t.slug} href={"#" + t.slug} onClick={(e) => { e.preventDefault(); show(t.slug); }} className="card" style={{ animationDelay: Math.min(i, 8) * 0.05 + "s" }}>
                <div className="card__media" style={{ aspectRatio: "3/4", background: "#d6d9df" }}>
                  <div data-zoom className="card__img card__img--top" style={{ backgroundColor: "#d6d9df", backgroundImage: a.bgImage, color: "var(--grey)", padding: 16 }}>{a.imgTag ? (<><span>{a.imgTag}</span><br /><span>{a.imgLabel}</span></>) : null}</div>
                  <span data-arrow className="card__arrow card__arrow--fill" aria-hidden="true" style={{ right: 12, bottom: 12 }}>→</span>
                </div>
                <div style={{ display: "grid", gap: 3 }}>
                  <div className="team-card__name" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.01em" }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: "var(--grey)", fontWeight: 500 }}>{t.role}</div>
                  <div style={{ fontSize: 13, color: "var(--red)", fontWeight: 700, marginTop: 4 }}>{t.mobile}</div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {o && (
        <div role="dialog" aria-modal="true" aria-label={o.name} className="sheet-wrap" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="sheet">
            <button type="button" aria-label="Close" className="sheet__close" onClick={close}>×</button>
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <div className="sheet__photo" style={{ backgroundImage: decorateAgent(o).bgImage }} />
              <div style={{ display: "grid", gap: 8 }}>
                <a href={"tel:+61" + o.mobile.replace(/\D/g, "").slice(1)} className="pill pill--red pill--md" style={{ justifyContent: "center" }}>Call {o.mobile}</a>
                <a href={"mailto:" + o.email} className="pill pill--ghost pill--md" style={{ justifyContent: "center" }}>Email {o.name.split(" ")[0]}</a>
              </div>
            </div>
            <div style={{ display: "grid", gap: 24, alignContent: "start", minWidth: 0 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <div className="kicker">{o.dept}</div>
                <h2 className="h2" style={{ fontSize: "clamp(1.8rem,1.2rem + 2vw,3rem)" }}>{o.name}</h2>
                <div style={{ fontSize: 16, color: "var(--grey-2)", fontWeight: 500 }}>{o.role}</div>
              </div>
              {o.bio ? <p className="lead" style={{ lineHeight: 1.65, maxWidth: "64ch" }}>{o.bio}</p> : <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--grey)", maxWidth: "60ch", fontStyle: "italic" }}>Profile to be written. The current site publishes a name, role and contact details only. A two or three sentence bio and a new portrait are required before launch.</p>}
              <div className="rows">
                {o.specialties ? <div className="row row--wide"><span className="row__k">Specialties</span><span className="row__v">{o.specialties}</span></div> : null}
                {o.awards ? <div className="row row--wide"><span className="row__k">Awards</span><span className="row__v">{o.awards}</span></div> : null}
                <div className="row row--wide"><span className="row__k">Mobile</span><span className="row__v"><a href={"tel:+61" + o.mobile.replace(/\D/g, "").slice(1)}>{o.mobile}</a></span></div>
                <div className="row row--wide"><span className="row__k">Email</span><span className="row__v" style={{ wordBreak: "break-all" }}><a href={"mailto:" + o.email}>{o.email}</a></span></div>
              </div>
              {listings.length > 0 && (
                <div style={{ display: "grid", gap: 14 }}>
                  <div className="kicker kicker--muted">Current and recent listings</div>
                  <div className="sheet__listings">
                    {listings.map((p) => (
                      <Link key={p.id} data-card href={propHref(p)} className="card" style={{ gap: 8 }}>
                        <div className="card__media" style={{ aspectRatio: "3/2" }}><div data-zoom className="card__img" style={{ backgroundImage: decorate(p).bgImage }} /></div>
                        <div style={{ fontSize: 14, fontWeight: 800 }}>{p.address}</div>
                        <div style={{ fontSize: 12, color: "var(--grey)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>{p.suburb} · {p.price}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="alerts-band">
        <div className="cta-band">
          <div style={{ display: "grid", gap: 12, maxWidth: 640 }}>
            <div className="kicker">Careers</div>
            <h2 className="h2--sm">Think you&apos;d fit in at mission control?</h2>
            <p className="body body--light" style={{ lineHeight: 1.55, maxWidth: "50ch" }}>We&apos;re always interested in meeting sales agents and property managers who know Logan. Send a note to the directors.</p>
          </div>
          <a href="mailto:parnam@redrocketrealty.com.au?subject=Careers%20at%20Red%20Rocket%20Realty" className="pill pill--white pill--arrow"><span>Get in touch</span><span className="pill__arrow" aria-hidden="true">→</span></a>
        </div>
      </section>
    </main>
  );
}
