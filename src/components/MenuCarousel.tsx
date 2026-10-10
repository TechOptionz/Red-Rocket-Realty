"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Photo from "@/components/Photo";

export type CarouselSlide = { key: string; href: string; photo: string; position?: string; badge: string; title: string; meta: string };

/**
 * Small rotating card for the desktop mega menu's feature rail (featured listings, latest news). One slide at a time
 * with its photo, auto-advancing while the menu is open. Arrows, dots, a counter and a progress bar; pauses on
 * hover/focus and honours reduced motion.
 */
export default function MenuCarousel({ label, slides, viewAll, viewAllHref, every = 5000, active, mountPhotos, onNavigate }: {
  label: string; slides: CarouselSlide[]; viewAll: string; viewAllHref: string; every?: number; active: boolean; mountPhotos: boolean; onNavigate: () => void;
}) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const n = slides.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Auto-advance. `i` is a dependency so the timer restarts after a manual change.
  const running = active && !paused && !reduced && n > 1;
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => { setDir(1); setI((x) => (x + 1) % n); }, every);
    return () => window.clearInterval(t);
  }, [running, n, i, every]);

  const go = (d: 1 | -1) => { setDir(d); setI((x) => (x + d + n) % n); };
  const jump = (k: number) => { setDir(k > i ? 1 : -1); setI(k); };

  if (!n) return null;
  const id = "mcar-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div className="mcar" data-paused={running ? "0" : "1"} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="mcar__head">
        <span className="mrail__k" id={id}>{label}</span>
        <Link href={viewAllHref} onClick={onNavigate}>{viewAll}</Link>
      </div>
      <div className="mcar__stage" data-dir={dir} aria-live="polite" aria-roledescription="carousel" aria-labelledby={id}>
        {slides.map((s, k) => {
          const on = k === i;
          return (
            <Link key={s.key} href={s.href} className="mcar__slide" data-on={on ? "1" : "0"} aria-hidden={!on} tabIndex={on ? 0 : -1} onClick={onNavigate} aria-roledescription="slide" aria-label={(k + 1) + " of " + n + ": " + s.title}>
              <span className="mcar__img">
                {mountPhotos ? <Photo src={s.photo} sizes="360px" quality={70} position={s.position} /> : null}
                <span className="mcar__badge">{s.badge}</span>
              </span>
              <b className="mcar__title">{s.title}</b>
              <span className="mcar__meta">{s.meta}</span>
            </Link>
          );
        })}
        {/* Controls sit over the photo (same aspect box) so the card stays compact: dots and arrows at the foot, counter top-right, progress bar on the bottom edge. */}
        <div className="mcar__ctrl" aria-hidden={n < 2 ? true : undefined}>
          <span className="mcar__count" aria-hidden="true">{i + 1} / {n}</span>
          {n > 1 ? (
            <>
              <div className="mcar__dots" role="tablist" aria-label={"Choose " + label.toLowerCase()}>
                {slides.map((s, k) => (
                  <button key={s.key} type="button" role="tab" aria-selected={k === i} aria-label={"Item " + (k + 1)} className="mcar__dot" data-on={k === i ? "1" : "0"} onClick={() => jump(k)} />
                ))}
              </div>
              <div className="mcar__arrows">
                <button type="button" className="mcar__btn" aria-label="Previous" onClick={() => go(-1)}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
                </button>
                <button type="button" className="mcar__btn" aria-label="Next" onClick={() => go(1)}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                </button>
              </div>
            </>
          ) : null}
          <div className="mcar__bar" aria-hidden="true">{running ? <span key={i} style={{ animationDuration: every + "ms" }} /> : null}</div>
        </div>
      </div>
    </div>
  );
}
