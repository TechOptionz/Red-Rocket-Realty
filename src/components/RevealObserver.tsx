"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide scroll choreography, ported from the prototype:
 * - [data-reveal] / [data-stagger] get data-in when they enter the viewport
 * - [data-mag] buttons lean toward the pointer (desktop only)
 * - [data-tilt] cards tilt in 3D under the cursor (data-tilt="lift" also raises them)
 * - [data-glow] blocks track the pointer: --mx/--my (px) and --dx/--dy (-.5..0.5)
 *   drive a cursor spotlight, a glowing border and magnetic numbers in CSS
 * - [data-drift] backgrounds drift on scroll
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "1");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.02 },
    );
    let driftEls: HTMLElement[] = [];
    const scan = () => {
      document.querySelectorAll("[data-reveal]:not([data-obs]),[data-stagger]:not([data-obs])").forEach((el) => {
        el.setAttribute("data-obs", "1");
        io.observe(el);
      });
      driftEls = Array.from(document.querySelectorAll<HTMLElement>("[data-drift]"));
    };
    scan();
    const fallback = () =>
      document.querySelectorAll("[data-reveal]:not([data-in]),[data-stagger]:not([data-in])").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.96 && r.bottom > 0) el.setAttribute("data-in", "1");
      });
    let fbRaf = 0;
    const fallbackSoon = () => {
      if (!fbRaf) fbRaf = requestAnimationFrame(() => { fbRaf = 0; fallback(); });
    };
    window.addEventListener("scroll", fallbackSoon, { passive: true });
    window.addEventListener("resize", fallbackSoon);
    const fbTimer = setInterval(fallbackSoon, 600);
    let st: ReturnType<typeof setTimeout> | undefined;
    const mo = new MutationObserver(() => {
      clearTimeout(st);
      st = setTimeout(scan, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const fine =
      window.matchMedia("(hover:hover) and (pointer:fine)").matches && !window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    let curMag: HTMLElement | null = null;
    let curTilt: HTMLElement | null = null;
    let curGlow: HTMLElement | null = null;
    const unglow = (el: HTMLElement) => {
      el.removeAttribute("data-glowing");
      el.style.setProperty("--dx", "0");
      el.style.setProperty("--dy", "0");
    };
    const untilt = (el: HTMLElement) => {
      el.removeAttribute("data-tilting");
      el.style.transform = "";
    };
    const unmag = (el: HTMLElement) => {
      el.style.transform = "";
      el.removeAttribute("data-magon");
    };
    const applyMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const closest = (sel: string) => (target && target.closest ? (target.closest(sel) as HTMLElement | null) : null);
      const t = closest("[data-mag]");
      if (curMag && curMag !== t) unmag(curMag);
      curMag = t;
      if (t) {
        const r = t.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        t.setAttribute("data-magon", "1");
        t.style.transform = "translate(" + (dx * 10).toFixed(1) + "px," + (dy * 8).toFixed(1) + "px)";
      }
      const tt = closest("[data-tilt]");
      if (curTilt && curTilt !== tt) untilt(curTilt);
      curTilt = tt;
      if (tt) {
        const r = tt.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        tt.setAttribute("data-tilting", "1");
        const lift = tt.getAttribute("data-tilt") === "lift" ? " translateY(-6px)" : "";
        tt.style.transform = "perspective(1200px) rotateX(" + (-dy * 5).toFixed(2) + "deg) rotateY(" + (dx * 6).toFixed(2) + "deg) translateZ(0)" + lift;
      }
      const g = closest("[data-glow]");
      if (curGlow && curGlow !== g) unglow(curGlow);
      curGlow = g;
      if (g) {
        const r = g.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        g.style.setProperty("--mx", x.toFixed(0) + "px");
        g.style.setProperty("--my", y.toFixed(0) + "px");
        g.style.setProperty("--dx", (x / r.width - 0.5).toFixed(3));
        g.style.setProperty("--dy", (y / r.height - 0.5).toFixed(3));
        g.setAttribute("data-glowing", "1");
      }
    };
    // One layout read/write pass per frame, whatever the pointer's report rate (high-DPI mice and 150% scaling can deliver several hundred events a second).
    let moveRaf = 0;
    let lastMove: PointerEvent | null = null;
    const onMove = (e: PointerEvent) => {
      if (!fine) return;
      lastMove = e;
      if (!moveRaf) moveRaf = requestAnimationFrame(() => { moveRaf = 0; if (lastMove) applyMove(lastMove); });
    };
    const onLeave = () => {
      if (curTilt) untilt(curTilt);
      if (curGlow) unglow(curGlow);
      if (curMag) unmag(curMag);
      curTilt = curGlow = curMag = null;
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave, true);

    let raf = 0;
    const drift = () => {
      const vh = window.innerHeight;
      driftEls.forEach((el) => {
        const r = (el.parentElement || el).getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const k = parseFloat(el.getAttribute("data-drift") || "") || 0.08;
        el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + "px,0)";
      });
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        drift();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    drift();

    return () => {
      io.disconnect();
      mo.disconnect();
      clearInterval(fbTimer);
      clearTimeout(st);
      cancelAnimationFrame(fbRaf);
      window.removeEventListener("scroll", fallbackSoon);
      window.removeEventListener("resize", fallbackSoon);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(moveRaf);
      onLeave();
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave, true);
    };
  }, [pathname]);

  return null;
}
