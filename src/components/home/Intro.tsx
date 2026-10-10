"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLogo } from "@/lib/useLogo";
import { logoRatio, logoSize } from "@/data/brand-dims";

/**
 * Decides whether the entry sequence runs and arms it by setting html[data-intro-on="1"].
 * Plays once per session, is skipped under reduced motion or when deep-linked to an anchor; ?intro=1 forces it.
 * The same logic ships as the inline BOOT script below so it runs while the HTML is parsed, before first paint: the panel
 * then covers the page from the very first frame and the hero's entrance animations stay paused until the curtain lifts.
 * arm() is also called from the effect (a no-op once the script has run) because inline scripts don't execute on
 * client-side navigation. Keep the two in sync.
 */
function arm() {
  try {
    const html = document.documentElement;
    if (html.getAttribute("data-intro-on")) return;
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const force = new URLSearchParams(window.location.search).get("intro") === "1";
    if (!force && (sessionStorage.getItem("rr-intro-seen") || window.location.hash)) return;
    sessionStorage.setItem("rr-intro-seen", "1");
    html.setAttribute("data-intro-on", "1");
  } catch {}
}
// A fixed string (not arm.toString()): the server and client bundles compile the function slightly differently, and any
// difference in the markup is a hydration mismatch.
const BOOT =
  '(function(){try{var h=document.documentElement;if(h.getAttribute("data-intro-on"))return;' +
  'if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;' +
  'var f=new URLSearchParams(location.search).get("intro")==="1";' +
  'if(!f&&(sessionStorage.getItem("rr-intro-seen")||location.hash))return;' +
  'sessionStorage.setItem("rr-intro-seen","1");h.setAttribute("data-intro-on","1")}catch(e){}})()';

const PROGRESS_MS = 1900; // counter + bar reach 100
const HOLD_MS = 2200; // curtain starts lifting
const EXIT_MS = 1150; // curtain fully gone

// Module flags so React StrictMode's double effect run (dev) re-arms instead of treating the sequence as already seen.
let armed = false;
let done = false;

type Phase = "boot" | "play" | "out";

export default function Intro() {
  // Rendered on the server so the dark panel is in the first HTML; CSS hides it unless arm() set the html attribute.
  const [on, setOn] = useState(true);
  const [phase, setPhase] = useState<Phase>("boot");
  const [imgReady, setImgReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const live = useRef(false);
  const raf = useRef(0);
  const timers = useRef<number[]>([]);
  const { logo } = useLogo();
  const emblem = logo.emblemDark || logo.dark;

  const end = () => {
    if (!live.current) return;
    live.current = false;
    done = true;
    cancelAnimationFrame(raf.current);
    timers.current.forEach(clearTimeout);
    if (num.current) num.current.textContent = "100";
    if (bar.current) bar.current.style.transform = "scaleX(1)";
    setPhase("out");
    const html = document.documentElement;
    timers.current = [
      // "out" releases the hero's animations as the curtain starts to lift (the rocket launches first).
      window.setTimeout(() => html.setAttribute("data-intro-on", "out"), 300),
      window.setTimeout(() => {
        html.removeAttribute("data-intro-on");
        setOn(false);
      }, EXIT_MS),
    ];
  };

  useEffect(() => {
    arm();
    const html = document.documentElement;
    if (html.getAttribute("data-intro-on") !== "1") {
      if (armed && !done) html.setAttribute("data-intro-on", "1");
      else {
        setOn(false);
        return;
      }
    }
    armed = true;
    live.current = true;
    setPhase("play");

    // Progress is written straight to the DOM: no React re-render per frame.
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / PROGRESS_MS);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      if (num.current) num.current.textContent = String(Math.round(e * 100)).padStart(3, "0");
      if (bar.current) bar.current.style.transform = "scaleX(" + e.toFixed(4) + ")";
      if (p < 1 && live.current) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    timers.current = [window.setTimeout(end, HOLD_MS)];

    // Keep the page still underneath without overflow:hidden, which would drop the scrollbar and shift the layout on exit.
    const block = (e: Event) => {
      if (live.current) e.preventDefault();
    };
    const keys = new Set([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]);
    const onKey = (e: KeyboardEvent) => {
      if (live.current && keys.has(e.key) && (e.target as HTMLElement).tagName !== "BUTTON") e.preventDefault();
    };
    const el = root.current;
    el?.addEventListener("wheel", block, { passive: false });
    el?.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", onKey);

    return () => {
      live.current = false;
      cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
      el?.removeEventListener("wheel", block);
      el?.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", onKey);
      html.removeAttribute("data-intro-on");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!on) return null;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <div ref={root} className="intro" data-phase={phase} role="status" aria-label="Loading Red Rocket Realty" onClick={end}>
        <div className="intro__panel" aria-hidden="true" />
        <div className="intro__glow" aria-hidden="true" />
        <div className="intro__body">
          {/* Mirrors the horizontal logo lockup: emblem left, RED ROCKET over a letter-spaced REALTY with the red rule. */}
          <div className="intro__lockup">
            <div className="intro__rocket" data-ready={imgReady ? "1" : "0"}>
              <Image className="intro__emblem" src={emblem} alt="" {...logoSize(emblem, 120)} style={logoRatio(emblem, 120)} priority onLoad={() => setImgReady(true)} />
              <span className="intro__trail" aria-hidden="true" />
            </div>
            <div className="intro__text" aria-hidden="true">
              <div className="intro__name"><span>Red Rocket</span></div>
              <div className="intro__sub"><span>Realty</span><i /></div>
            </div>
          </div>
          <div className="intro__kick">Springwood · Logan · Since the 2000s</div>
        </div>
        <div className="intro__foot">
          <span className="intro__count" ref={num}>000</span>
          <span>Loading</span>
        </div>
        <button type="button" className="intro__skip" onClick={end}>Skip</button>
        <div className="intro__bar" aria-hidden="true"><span ref={bar} /></div>
      </div>
    </>
  );
}
