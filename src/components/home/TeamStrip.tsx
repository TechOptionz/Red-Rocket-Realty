"use client";
import { useState } from "react";
import Link from "next/link";
import { DEPTS, PAGES, TEAM, decorateAgent } from "@/data/rr-data";
import Lines from "@/components/Lines";
import Photo from "@/components/Photo";

const shades = ["#d6d9df", "#cfd3da", "#dadde3", "#c8ccd3", "#d2d6dc"];

export default function TeamStrip() {
  const [dept, setDept] = useState("All");
  const team = TEAM.filter((t) => dept === "All" || t.dept === dept);
  return (
    <section id="team" className="section--bg" style={{ padding: "var(--sec-y) 0", overflow: "hidden" }}>
      <div className="sec-head px" style={{ marginBottom: 32 }}>
        <div className="sec-head__text" style={{ gap: 18 }}>
          <div className="kicker">Our team</div>
          <Lines className="h2" lines={["Nineteen locals.", "One office in Springwood."]} />
        </div>
        <Link data-mag href={PAGES.team} className="pill pill--dark" style={{ flex: "none" }}>Meet the team</Link>
      </div>
      <div className="strip" style={{ gap: 8, paddingBottom: 32 }}>
        {DEPTS.map((d) => (
          <button key={d} type="button" className="chip" data-on={d === dept ? "1" : "0"} onClick={() => setDept(d)}>{d}</button>
        ))}
      </div>
      <div className="strip">
        {team.map((t, i) => {
          const a = decorateAgent(t);
          return (
            <Link key={t.slug} data-card href={a.teamHref} className="card team-card">
              <div className="card__media" style={{ aspectRatio: "3/4", background: "#d6d9df" }}>
                <div data-zoom className="card__img card__img--top" style={{ backgroundColor: shades[i % shades.length], backgroundImage: t.photo ? undefined : a.bgImage, color: "var(--grey)" }}>
                  {t.photo ? <Photo src={t.photo} sizes="(max-width: 720px) 66vw, 280px" position="center top" /> : null}
                  {a.imgTag ? (<><span>{a.imgTag}</span><br /><span>{a.imgLabel}</span></>) : null}
                </div>
              </div>
              <div className="card__body" style={{ gap: 3 }}>
                <div className="team-card__name">{t.name}</div>
                <div className="team-card__role">{t.role}</div>
                {t.tagline ? <div className="team-card__strip-tag">{t.tagline}</div> : null}
                <div className="team-card__mobile">{t.mobile}</div>
              </div>
            </Link>
          );
        })}
        <div className="strip-end" aria-hidden="true" />
      </div>
      <div className="mono-note px" style={{ paddingTop: 28 }}>Existing 600 px headshots suit card size only · originals or a reshoot needed for large display · new photos for Parnam Singh Heir and Tanveer Singh</div>
    </section>
  );
}
