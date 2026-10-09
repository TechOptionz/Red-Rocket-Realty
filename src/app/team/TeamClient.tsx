"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AGENCY_AREAS, CONTACT, DEPTS, LAND, PAGES, PHOTOS, SALE, SOLD, TEAM, agentBlurb, agentHelp, agentHighlights, agentSocials, decorate, decorateAgent, propHref, telHref } from "@/data/rr-data";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";
import { SocialIcon, SocialLinks } from "@/components/SocialIcons";
import Photo from "@/components/Photo";

export default function TeamClient() {
  const [dept, setDept] = useState("All");
  const [open, setOpen] = useState("");
  useEffect(() => {
    try { const d = new URLSearchParams(window.location.search).get("dept"); if (d && DEPTS.includes(d)) setDept(d); } catch {}
  }, []);

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
  const isOffice = (n: string) => n.replace(/\s/g, "") === CONTACT.phone.replace(/\s/g, "");

  return (
    <main>
      <section className="hero hero--page" style={{ minHeight: "80svh" }}>
        <div className="bsr__bg" aria-hidden="true"><Photo src={PHOTOS.hero.team} sizes="100vw" priority quality={75} /></div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__body">
          <Crumb tone="light" items={[["About", PAGES.about], ["Our team"]]} />
          <div className="stack-m" style={{ flexWrap: "wrap", gap: 32, alignItems: "flex-end" }}>
            <div style={{ display: "grid", gap: 20, maxWidth: 900 }}>
              <Lines as="h1" className="display-xl" style={{ fontSize: "clamp(2.6rem,1.4rem + 5vw,6.4rem)", letterSpacing: "-.035em", lineHeight: .96 }} lines={["Nineteen locals.", <><span style={{ color: "var(--brand-red)" }}>One</span> team.</>]} />
              <p className="hero__sub">Directors, sales agents, property managers, leasing and inspections, all working from 67 Springwood Road. Pick a department or browse everyone.</p>
            </div>
            <a href={CONTACT.phoneHref} className="pill pill--white pill--arrow" style={{ flex: "none" }}><span>{CONTACT.phone}</span><span className="pill__arrow" aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <section className="hero-bar">
        <div className="strip" role="tablist" aria-label="Department" style={{ gap: 8, padding: "40px 0 32px", borderBottom: "1px solid rgba(17,19,24,.12)" }}>
          {DEPTS.map((d) => (
            <button key={d} type="button" role="tab" aria-selected={d === dept} className="chip chip--white" data-on={d === dept ? "1" : "0"} onClick={() => setDept(d)}>{d} <span style={{ fontWeight: 500, opacity: .7 }}>{d === "All" ? TEAM.length : TEAM.filter((t) => t.dept === d).length}</span></button>
          ))}
        </div>
      </section>

      <section className="section--bg" style={{ padding: "40px var(--pad-x) var(--sec-y)" }}>
        <div className="team-grid">
          {team.map((t, i) => {
            const a = decorateAgent(t);
            const office = isOffice(t.mobile);
            return (
              <article key={dept + t.slug} data-card id={t.slug} className="card team-card" style={{ animationDelay: Math.min(i, 8) * 0.05 + "s" }}>
                <a href={"#" + t.slug} onClick={(e) => { e.preventDefault(); show(t.slug); }} className="team-card__link" aria-label={"Open profile: " + t.name}>
                  <div className="card__media team-card__media">
                    <div data-zoom className="card__img card__img--top" style={{ backgroundColor: "#d6d9df", backgroundImage: t.photo ? undefined : a.bgImage, color: "var(--grey)", padding: 16 }}>{t.photo ? <Photo src={t.photo} sizes="(max-width: 720px) 66vw, 280px" position="center top" /> : null}{a.imgTag ? (<><span>{a.imgTag}</span><br /><span>{a.imgLabel}</span></>) : null}</div>
                    <span data-arrow className="card__arrow card__arrow--fill" aria-hidden="true" style={{ right: 12, bottom: 12 }}>→</span>
                  </div>
                  <div className="team-card__body">
                    <div className="team-card__dept">{t.dept}</div>
                    <div className="team-card__name">{t.name}</div>
                    <div className="team-card__role">{t.role}</div>
                    {t.tagline ? <p className="team-card__tag">{t.tagline}</p> : null}
                  </div>
                </a>
                <div className="team-card__foot">
                  <div className="team-card__foot-top">
                    <a href={telHref(t.mobile)} className="team-card__phone"><SocialIcon kind="phone" size={13} /><span>{t.mobile}</span>{office ? <span className="team-card__phone-note">office</span> : null}</a>
                    <SocialLinks links={agentSocials(t)} owner={t.name} size="sm" />
                  </div>
                  <a href={"mailto:" + t.email} className="team-card__email"><SocialIcon kind="email" size={13} /><span>{t.email}</span></a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {o && (
        <div role="dialog" aria-modal="true" aria-label={o.name} className="sheet-wrap" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="sheet">
            <button type="button" aria-label="Close" className="sheet__close" onClick={close}>×</button>
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <div className="sheet__photo" style={{ backgroundImage: o.photo ? undefined : decorateAgent(o).bgImage }}>{o.photo ? <Photo src={o.photo} sizes="(max-width: 980px) 100vw, 360px" position="center top" /> : null}</div>
              <div style={{ display: "grid", gap: 8 }}>
                <a href={telHref(o.mobile)} className="pill pill--red pill--md" style={{ justifyContent: "center" }}>Call {o.mobile}</a>
                <a href={"mailto:" + o.email} className="pill pill--ghost pill--md" style={{ justifyContent: "center" }}>Email {o.name.split(" ")[0]}</a>
              </div>
              <div className="sheet__connect">
                <span className="sheet__connect-k">Connect</span>
                <SocialLinks links={agentSocials(o)} owner={o.name} />
              </div>
            </div>
            <div style={{ display: "grid", gap: 24, alignContent: "start", minWidth: 0 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <div className="kicker">{o.dept}</div>
                <h2 className="h2" style={{ fontSize: "clamp(1.8rem,1.2rem + 2vw,3rem)" }}>{o.name}</h2>
                <div style={{ fontSize: 16, color: "var(--grey-2)", fontWeight: 500 }}>{o.role}</div>
              </div>
              <p className="lead" style={{ lineHeight: 1.65, maxWidth: "64ch" }}>{agentBlurb(o)}</p>
              {agentHighlights(o).length > 0 && (
                <div className="sheet__stats">
                  {agentHighlights(o).map((h) => (
                    <div key={h.k} className="stat-tile"><div className="stat-tile__v">{h.v}</div><div className="stat-tile__k">{h.k}</div></div>
                  ))}
                </div>
              )}
              <div className="sheet__cols">
                {o.career && o.career.length > 0 && (
                  <div className="sheet__block">
                    <div className="kicker kicker--muted">Career</div>
                    <ul className="sheet__career">
                      {o.career.map((c) => <li key={c}>{c}</li>)}
                    </ul>
                  </div>
                )}
                <div className="sheet__block">
                  <div className="kicker kicker--muted">How {o.name.split(" ")[0]} can help</div>
                  <ul className="sheet__help">
                    {agentHelp(o).map((h) => <li key={h}><span className="sheet__tick" aria-hidden="true">✓</span>{h}</li>)}
                  </ul>
                </div>
              </div>
              <div className="rows">
                {o.experience ? <div className="row row--wide"><span className="row__k">Experience</span><span className="row__v">{o.experience}</span></div> : null}
                {o.specialties ? <div className="row row--wide"><span className="row__k">Specialties</span><span className="row__v">{o.specialties}</span></div> : null}
                {o.awards ? <div className="row row--wide"><span className="row__k">Awards</span><span className="row__v">{o.awards}</span></div> : null}
                {o.languages ? <div className="row row--wide"><span className="row__k">Languages</span><span className="row__v">{o.languages}</span></div> : null}
                <div className="row row--wide"><span className="row__k">{isOffice(o.mobile) ? "Office" : "Mobile"}</span><span className="row__v"><a href={telHref(o.mobile)}>{o.mobile}</a></span></div>
                <div className="row row--wide"><span className="row__k">Email</span><span className="row__v" style={{ wordBreak: "break-all" }}><a href={"mailto:" + o.email}>{o.email}</a></span></div>
                <div className="row row--wide"><span className="row__k">Areas</span><span className="row__v">{o.areas || AGENCY_AREAS}</span></div>
                <div className="row row--wide"><span className="row__k">Office</span><span className="row__v">{CONTACT.address}</span></div>
                {o.rma ? <div className="row row--wide"><span className="row__k">Reviews</span><span className="row__v"><a href={o.rma} target="_blank" rel="noopener noreferrer">Verified client reviews on RateMyAgent ↗</a></span></div> : null}
              </div>
              {listings.length > 0 && (
                <div style={{ display: "grid", gap: 14 }}>
                  <div className="kicker kicker--muted">Current and recent listings</div>
                  <div className="sheet__listings">
                    {listings.map((p) => (
                      <Link key={p.id} data-card href={propHref(p)} className="card" style={{ gap: 8 }}>
                        <div className="card__media" style={{ aspectRatio: "3/2" }}><div data-zoom className="card__img" style={{ backgroundImage: p.photo ? undefined : decorate(p).bgImage }}>{p.photo ? <Photo src={p.photo} sizes="200px" /> : null}</div></div>
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
