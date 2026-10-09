"use client";
import { useEffect, useState, type RefObject } from "react";

/**
 * 0..100 progress for a scroll-linked fill (word reveal, clip-path wipe).
 *
 * Measured against the element itself, not its padded section, and tuned so the fill is complete while the
 * element is still comfortably on screen: it starts when the top crosses 95% of the viewport and is done by the time
 * the bottom reaches 85% (short blocks) or the top reaches 30% (tall blocks), whichever comes first. The old formula
 * needed the section to climb well past the top of the viewport on tall or scaled displays, which left most of the
 * text in its "off" colour while it was fully visible.
 *
 * Re-measured on scroll and resize, but also when layout shifts without a scroll event: web fonts arriving, images or
 * the header settling, a bfcache restore (pageshow), or the element itself changing size. Reduced-motion users get the
 * finished state straight away.
 */
export default function useScrollFill(ref: RefObject<HTMLElement | null>) {
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setFill(100); return; }
    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      const start = vh * 0.95;
      const end = Math.max(vh * 0.85 - r.height, vh * 0.3);
      const p = Math.max(0, Math.min(1, (start - r.top) / Math.max(1, start - end)));
      setFill(Math.round(p * 100));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    window.addEventListener("load", schedule);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    ro?.observe(el);
    ro?.observe(document.body);
    if (document.fonts?.ready) document.fonts.ready.then(schedule, () => {});
    // A late pass for anything that moved the element after hydration without resizing <body> (e.g. hero image decode).
    const settle = window.setTimeout(schedule, 600);
    measure();
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      ro?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
      window.removeEventListener("load", schedule);
    };
  }, [ref]);
  return fill;
}
