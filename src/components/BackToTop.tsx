"use client";
import { useEffect, useState } from "react";

/**
 * Site-wide "back to top" button (desktop and phone). Fixed to the bottom-right corner, it fades in once the page has
 * been scrolled past roughly one viewport and scrolls smoothly back to the top. Hidden while the mobile menu locks the page.
 */
export default function BackToTop() {
  const [show, setShow] = useState(false);

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
  };

  return (
    <button type="button" className="totop" data-show={show ? "1" : "0"} aria-label="Back to top" title="Back to top" tabIndex={show ? 0 : -1} onClick={toTop}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
    </button>
  );
}
