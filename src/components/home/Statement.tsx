"use client";
import { useEffect, useRef, useState } from "react";

/** Oversized outlined statement that fills with solid ink as it scrolls into view. */
export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  const [fill, setFill] = useState(0);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (vh * 0.92 - r.top) / (r.height * 0.55 + vh * 0.3)));
      setFill(Math.round(p * 100));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return (
    <section ref={ref} className="statement">
      <div className="statement__wrap">
        <div className="statement__ghost" aria-hidden="true">We live<br />and breathe<br />Logan.</div>
        <div className="statement__fill" style={{ clipPath: `inset(0 ${100 - fill}% 0 0)` }}>
          <span>We live<br />and breathe<br /><span style={{ color: "var(--red)" }}>Logan.</span></span>
        </div>
      </div>
      <div className="statement__foot">
        <p data-reveal className="lead" style={{ maxWidth: "44ch", lineHeight: 1.55 }}>Our agents are locals, not just professionals. Helping people buy, sell and rent should make the community larger and stronger, and support the local businesses and schools around it.</p>
        <a data-reveal href="#about" className="text-link" style={{ transitionDelay: ".1s" }}>Our mission and vision <span className="text-link__ring" aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}
