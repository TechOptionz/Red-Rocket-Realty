"use client";
import { useRef } from "react";
import Link from "next/link";
import { SALE, PAGES, propHref, specs } from "@/data/rr-data";
import Lines from "@/components/Lines";
import Photo from "@/components/Photo";

export default function FeaturedStrip() {
  const strip = useRef<HTMLDivElement>(null);
  const featured = SALE.filter((p) => p.photo).slice(0, 8);

  const scrollBy = (dir: number) => {
    const el = strip.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.7, 640), behavior: "smooth" });
  };
  const dragStart = (e: React.PointerEvent) => {
    const el = strip.current;
    if (!el || e.pointerType === "touch") return;
    const x0 = e.clientX;
    const s0 = el.scrollLeft;
    let moved = false;
    el.style.cursor = "grabbing";
    el.style.scrollSnapType = "none";
    const mv = (ev: PointerEvent) => {
      const dx = ev.clientX - x0;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = s0 - dx;
    };
    const up = () => {
      el.style.cursor = "";
      el.style.scrollSnapType = "";
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      if (moved) {
        const stop = (ce: Event) => {
          ce.preventDefault();
          ce.stopPropagation();
          el.removeEventListener("click", stop, true);
        };
        el.addEventListener("click", stop, true);
        setTimeout(() => el.removeEventListener("click", stop, true), 50);
      }
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
  };

  return (
    <section className="feat">
      <div className="sec-head px">
        <div className="sec-head__text" style={{ gap: 18 }}>
          <div className="kicker">Latest listings</div>
          <Lines className="h2" lines={["Fresh on the launch pad."]} />
          <p data-reveal className="body" style={{ fontSize: 16, lineHeight: 1.55, maxWidth: "48ch" }}>Houses, units, townhouses and land across Logan, newest first. Open home times save straight to your calendar.</p>
        </div>
      </div>
      <div ref={strip} className="acc-strip" onPointerDown={dragStart}>
        {featured.map((p, i) => {
          const blurb = p.headline || (p.desc && p.desc[0] ? p.desc[0].split(". ")[0] + "." : p.land ? p.type + " on " + p.land + " in " + p.suburb + "." : p.type + " in " + p.suburb + ".");
          return (
            <Link key={p.id} href={propHref(p)} className="acc-card" data-reveal style={{ transitionDelay: Math.min(i, 6) * 0.08 + "s" }}>
              <div className="acc-card__img" style={{ backgroundColor: p.shade }}><Photo src={p.photo!} sizes="(max-width: 720px) 74vw, 520px" /></div>
              <div className="acc-card__shade" aria-hidden="true" />
              {p.status ? <span className="tag">{p.status}</span> : null}
              <span className="acc-card__arrow" aria-hidden="true">→</span>
              <div className="acc-card__body">
                <div className="acc-card__title">{p.address}</div>
                <div className="acc-card__meta"><span aria-hidden="true" />{p.suburb}</div>
                <div className="acc-card__desc"><p>{blurb}</p></div>
                <div className="acc-card__price"><b>{p.price}</b><span>{specs(p).join(" · ")}</span></div>
                {p.inspection ? <div className="acc-card__open"><span>●</span> Open home · {p.inspection}</div> : null}
              </div>
            </Link>
          );
        })}
        <div className="strip-end" aria-hidden="true" />
      </div>
      <div className="feat__foot">
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" aria-label="Previous" className="circle-btn" onClick={() => scrollBy(-1)}>←</button>
          <button type="button" aria-label="Next" className="circle-btn" onClick={() => scrollBy(1)}>→</button>
        </div>
        <Link data-mag href={PAGES.listings + "?mode=buy"} className="pill pill--red pill--arrow"><span>View all for sale</span><span className="pill__arrow" aria-hidden="true">→</span></Link>
      </div>
      <div className="mono-note px" style={{ paddingTop: 28 }}>Sample data · cards are fed live from the listing feed (price text, status, inspection times, agent)</div>
    </section>
  );
}
