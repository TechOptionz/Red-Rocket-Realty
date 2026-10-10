"use client";
import { useEffect, useRef, useState } from "react";
import { useLogo } from "@/lib/useLogo";

const LAUNCH_MS = 700; // matches the totop-launch animation in globals.css

/**
 * Site-wide "back to top" button (desktop and phone). Fixed to the bottom-right corner, it fades in once the page has
 * been scrolled past roughly one viewport and scrolls smoothly back to the top. Hidden while the mobile menu locks the page.
 * The icon is the chosen logo's rocket emblem, used as a CSS mask filled with currentColor (brand red, no circle). The ship
 * (rocket + flame) idles with a slow float, lifts with an exhaust flame on hover, and launches off the top when clicked.
 * After a launch the button stays hidden while the page is still scrolling up, so the rocket never pops back mid-flight.
 * The flown ship is only reset to its idle pose as the button next fades in, so it never flashes back while fading out.
 */
export default function BackToTop() {
  const [show, setShow] = useState(false);
  const [launch, setLaunch] = useState(false);
  const launching = useRef(false); // launch animation playing: leave `show` alone
  const settling = useRef(false); // launched and still scrolling up: keep hidden until the scroll reaches the top or stops
  const lastY = useRef(0);
  const timer = useRef(0);
  const { logo } = useLogo();
  const rocket = "url(" + (logo.emblemDark || logo.dark) + ")";

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      if (launching.current) return;
      const y = window.scrollY;
      const past = y > Math.max(480, window.innerHeight * 0.9);
      if (settling.current) {
        // Hidden while the launch scroll is still heading up. Settling ends at the top, or when the user scrolls back down
        // (a frame where the position does not move is not an interruption: smooth scrolling can stall for a frame).
        const interrupted = y > lastY.current + 1;
        lastY.current = y;
        if (!past) settling.current = false;
        if (!past || !interrupted) { setShow(false); return; }
        settling.current = false; // fall through and show normally
      }
      lastY.current = y;
      if (past) setLaunch(false); // reset the flown ship only as the button comes back
      setShow(past);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    if (reduce || launching.current) return;
    launching.current = true;
    lastY.current = window.scrollY;
    setLaunch(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      // The ship has flown off the top: drop the button out too and keep it away while the page is still scrolling up.
      // `launch` stays on so the ship remains flown (opacity 0) while the button fades, instead of snapping back into view.
      launching.current = false;
      settling.current = true;
      lastY.current = window.scrollY;
      setShow(false);
    }, LAUNCH_MS);
  };

  return (
    <button type="button" className="totop" data-show={show ? "1" : "0"} data-launch={launch ? "1" : "0"} aria-label="Back to top" title="Back to top" tabIndex={show ? 0 : -1} onClick={toTop}>
      <span className="totop__ship" aria-hidden="true">
        <span className="totop__flame" />
        <span className="totop__rocket" style={{ WebkitMaskImage: rocket, maskImage: rocket }} />
      </span>
      <span className="totop__label" aria-hidden="true">Top</span>
    </button>
  );
}
