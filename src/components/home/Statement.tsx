"use client";
import { useRef } from "react";
import useScrollFill from "@/lib/useScrollFill";

/** Oversized outlined statement that fills with solid ink as it scrolls into view. */
export default function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const fill = useScrollFill(ref);
  return (
    <section className="statement">
      <div ref={ref} className="statement__wrap">
        <div className="statement__ghost" aria-hidden="true">We live<br />and breathe<br />Logan.</div>
        <div className="statement__fill" style={{ clipPath: `inset(0 ${100 - fill}% 0 0)` }}>
          <span>We live<br />and breathe<br />Logan.</span>
        </div>
      </div>
      <div className="statement__foot">
        <p data-reveal className="lead" style={{ maxWidth: "44ch", lineHeight: 1.55 }}>Our agents are locals, not just professionals. Helping people buy, sell and rent should make the community larger and stronger, and support the local businesses and schools around it.</p>
        <a data-reveal href="#about" className="text-link" style={{ transitionDelay: ".1s" }}>Our mission and vision <span className="text-link__ring" aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}
