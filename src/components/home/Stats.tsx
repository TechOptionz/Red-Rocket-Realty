"use client";
import { useEffect, useRef, useState } from "react";
import { CONTACT, TEAM } from "@/data/rr-data";

export default function Stats() {
  const ref = useRef<HTMLElement>(null);
  const [v, setV] = useState([0, 0, 0, 0]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const targets = [CONTACT.rating, CONTACT.reviews, CONTACT.years, TEAM.length];
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const dur = 2000;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - t, 3);
        setV(targets.map((x) => x * e));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.25 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section ref={ref} className="section section--red">
      <div className="kicker" style={{ marginBottom: 40 }}>Trusted across Logan</div>
      <div className="stats">
        <div className="stat"><div className="stat__n">{v[0].toFixed(1)}</div><div className="stat__k">RateMyAgent rating</div></div>
        <div className="stat"><div className="stat__n">{Math.round(v[1])}</div><div className="stat__k">Verified reviews</div></div>
        <div className="stat"><div className="stat__n">{Math.round(v[2])}+</div><div className="stat__k">Years serving Logan</div></div>
        <div className="stat"><div className="stat__n">{Math.round(v[3])}</div><div className="stat__k">Local team members</div></div>
      </div>
      <div className="mono-note" style={{ marginTop: 48 }}>Rating and review count as published on the current site · replace with live RateMyAgent feed · years claim to be confirmed by the agency</div>
    </section>
  );
}
