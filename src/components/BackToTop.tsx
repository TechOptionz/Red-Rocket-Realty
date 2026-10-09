"use client";
import { useEffect, useState } from "react";
import { useLogo } from "@/lib/useLogo";

/**
 * Site-wide "back to top" button (desktop and phone). Fixed to the bottom-right corner, it fades in once the page has
 * been scrolled past roughly one viewport and scrolls smoothly back to the top. Hidden while the mobile menu locks the page.
 * The icon is the chosen logo's rocket emblem, used as a CSS mask filled with currentColor (brand red, no circle). It idles with
 * a slow float, lifts with an exhaust flame on hover, and plays a short launch animation when clicked before scrolling up.
 */
export default function BackToTop() {
  const [show, setShow] = useState(false);
  const [launch, setLaunch] = useState(false);
  const { logo } = useLogo();
  const rocket = "url(" + (logo.emblemDark || logo.dark) + ")";

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setShow(window.scrollY > Math.max(480, window.innerHeight * 0.9));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    if (reduce) return;
    setLaunch(true);
    window.setTimeout(() => setLaunch(false), 750);
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
