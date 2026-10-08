"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide scroll choreography, ported from the prototype:
 * - [data-reveal] / [data-stagger] get data-in when they enter the viewport
 * - [data-mag] buttons lean toward the pointer (desktop only)
 * - [data-tilt] cards tilt in 3D under the cursor
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
    const scan = () =>
      document.querySelectorAll("[data-reveal]:not([data-obs]),[data-stagger]:not([data-obs])").forEach((el) => {
        el.setAttribute("data-obs", "1");
        io.observe(el);
      });
    scan();
    const fallback = () =>
      document.querySelectorAll("[data-reveal]:not([data-in]),[data-stagger]:not([data-in])").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.96 && r.bottom > 0) el.setAttribute("data-in", "1");
      });
    window.addEventListener("scroll", fallback, { passive: true });
    window.addEventListener("resize", fallback);
    const fbTimer = setInterval(fallback, 600);
    let st: ReturnType<typeof setTimeout> | undefined;
    const mo = new MutationObserver(() => {
      clearTimeout(st);
      st = setTimeout(scan, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const fine =
      window.matchMedia("(hover:hover) and (pointer:fine)").matches && !window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const onMove = (e: PointerEvent) => {
      if (!fine) return;
      const target = e.target as HTMLElement | null;
      const t = target && target.closest ? (target.closest("[data-mag]") as HTMLElement | null) : null;
      document.querySelectorAll<HTMLElement>("[data-mag][data-magon]").forEach((el) => {
        if (el !== t) {
          el.style.transform = "";
          el.removeAttribute("data-magon");
        }
      });
      if (t) {
        const r = t.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        t.setAttribute("data-magon", "1");
        t.style.transform = "translate(" + (dx * 10).toFixed(1) + "px," + (dy * 8).toFixed(1) + "px)";
      }
      const tt = target && target.closest ? (target.closest("[data-tilt]") as HTMLElement | null) : null;
      document.querySelectorAll<HTMLElement>("[data-tilt][data-tilting]").forEach((el) => {
        if (el !== tt) {
          el.removeAttribute("data-tilting");
          el.style.transform = "";
        }
      });
      if (tt) {
        const r = tt.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        tt.setAttribute("data-tilting", "1");
        tt.style.transform = "perspective(1200px) rotateX(" + (-dy * 5).toFixed(2) + "deg) rotateY(" + (dx * 6).toFixed(2) + "deg) translateZ(0)";
      }
    };
    const onLeave = () =>
      document.querySelectorAll<HTMLElement>("[data-tilt][data-tilting]").forEach((el) => {
        el.removeAttribute("data-tilting");
        el.style.transform = "";
      });
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave, true);

    let raf = 0;
    const drift = () => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-drift]").forEach((el) => {
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
      window.removeEventListener("scroll", fallback);
      window.removeEventListener("resize", fallback);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave, true);
    };
  }, [pathname]);

  return null;
}
