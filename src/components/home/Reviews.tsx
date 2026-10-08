"use client";
import { useRef, useState } from "react";
import { CONTACT, TESTIMONIALS } from "@/data/rr-data";

export default function Reviews() {
  const [idx, setIdx] = useState(0);
  const [op, setOp] = useState(1);
  const [shift, setShift] = useState("0px");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const n = TESTIMONIALS.length;
  const cur = TESTIMONIALS[idx];
  const go = (dir: number) => {
    setOp(0);
    setShift(dir > 0 ? "-10px" : "10px");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setIdx((i) => (i + dir + n) % n);
      setOp(1);
      setShift("0px");
    }, 240);
  };
  return (
    <section id="reviews" className="section section--white">
      <div className="cols2" style={{ gridTemplateColumns: "1fr 1.6fr" }}>
        <div className="sticky" style={{ display: "grid", gap: 24 }}>
          <div className="kicker">Verified reviews</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontSize: "clamp(3rem,5vw,4.5rem)", fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1 }}>{CONTACT.rating}</span>
            <span className="stars" aria-hidden="true" style={{ fontSize: 18 }}>★★★★★</span>
          </div>
          <p className="body" style={{ lineHeight: 1.55, maxWidth: "36ch" }}>Based on {CONTACT.reviews} reviews from buyers, sellers and landlords on RateMyAgent.</p>
          <a href={CONTACT.rma} target="_blank" rel="noopener" className="text-link">Read all reviews <span className="text-link__ring" aria-hidden="true">↗</span></a>
        </div>
        <div style={{ display: "grid", gap: 36 }}>
          <blockquote className="quote" style={{ margin: 0, opacity: op, transform: `translateY(${shift})` }}>{cur.text}</blockquote>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", transition: "opacity .25s ease", opacity: op }}>
            <div style={{ display: "grid", gap: 4 }}><div style={{ fontSize: 15, fontWeight: 800 }}>{cur.who}</div><div style={{ fontSize: 13, color: "var(--grey)" }}>with {cur.agent}</div></div>
            <div className="mono-note">Paraphrased · publish verbatim</div>
          </div>
          <div className="quote-nav">
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" aria-label="Previous review" className="circle-btn" onClick={() => go(-1)}>←</button>
              <button type="button" aria-label="Next review" className="circle-btn" onClick={() => go(1)}>→</button>
            </div>
            <div className="num" style={{ fontSize: 13, fontWeight: 700, color: "var(--grey)" }}><span style={{ color: "var(--ink)" }}>{String(idx + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}</div>
            <div className="quote-prog"><div style={{ width: ((idx + 1) / n) * 100 + "%" }} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
