"use client";
import { useEffect, useRef, useState } from "react";
import { useLogo } from "@/lib/useLogo";
import Image from "next/image";
import { logoSize } from "@/data/brand-dims";

/** Entry sequence: plays once per session, skippable, skipped under reduced motion or when deep-linked to an anchor. Add ?intro=1 to force it. */
export default function Intro() {
  const [on, setOn] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [count, setCount] = useState(0);
  const running = useRef(false);
  const raf = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { logo } = useLogo();

  const end = () => {
    if (!running.current) return;
    running.current = false;
    clearTimeout(timer.current);
    cancelAnimationFrame(raf.current);
    setLeaving(true);
    setCount(100);
    setTimeout(() => document.documentElement.removeAttribute("data-intro-on"), 150);
    setTimeout(() => setOn(false), 1150);
  };

  useEffect(() => {
    try {
      const reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
      const force = new URLSearchParams(window.location.search).get("intro") === "1";
      if (reduced || !(force || (!sessionStorage.getItem("rr-intro-seen") && !window.location.hash))) return;
      sessionStorage.setItem("rr-intro-seen", "1");
      document.documentElement.setAttribute("data-intro-on", "1");
      setOn(true);
      running.current = true;
      const t0 = performance.now();
      const dur = 1900;
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(e * 100));
        if (p < 1 && running.current) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
      timer.current = setTimeout(end, 2300);
    } catch {}
    return () => {
      clearTimeout(timer.current);
      cancelAnimationFrame(raf.current);
      document.documentElement.removeAttribute("data-intro-on");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!on) return null;
  return (
    <div className="intro" data-leaving={leaving ? "1" : "0"} role="status" aria-label="Loading Red Rocket Realty" onClick={end}>
      <div className="intro__line" aria-hidden="true"><span /></div>
      <div style={{ position: "relative", display: "grid", justifyItems: "center", gap: 28, padding: "0 20px", textAlign: "center" }}>
        <Image className="intro__emblem" src={logo.emblemDark || logo.dark} alt="" {...logoSize(logo.emblemDark || logo.dark, 120)} priority />
        <div className="intro__word" aria-hidden="true">
          <span><span style={{ animationDelay: ".55s" }}>Red Rocket</span></span>
          <span><span style={{ animationDelay: ".68s", color: "var(--brand-red)" }}>Realty</span></span>
        </div>
        <div className="intro__kick">Springwood · Logan · Since the 2000s</div>
      </div>
      <div className="intro__foot"><span className="intro__count">{String(count).padStart(3, "0")}</span><span>Loading</span></div>
      <button type="button" className="intro__skip" onClick={end}>Skip</button>
    </div>
  );
}
