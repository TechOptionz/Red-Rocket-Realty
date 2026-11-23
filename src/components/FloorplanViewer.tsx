"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { loaderFor } from "@/components/Photo";
import { isLockedOn, lockedOnAt } from "@/lib/feed/lockedon-image";

export type Plan = { src: string; w: number; h: number };
type Props = { plans: Plan[]; index: number; title: string; subtitle?: string; onClose: () => void; onIndex: (i: number) => void };

const MIN = 1, MAX = 5, STEP = 1.6, CLICK_ZOOM = 2.5;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
type View = { s: number; x: number; y: number };
const FIT: View = { s: 1, x: 0, y: 0 };

const Svg = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

/**
 * Full-screen floor plan viewer on the page itself (no new tab). Fit-to-screen first; click/tap to zoom where you point,
 * wheel or pinch to zoom smoothly, drag to pan, arrows/swipe between plans. A sharper rendition loads once you zoom in.
 */
export default function FloorplanViewer({ plans, index, title, subtitle, onClose, onIndex }: Props) {
  const n = plans.length;
  const i = ((index % n) + n) % n;
  const plan = plans[i];
  const [view, setView] = useState<View>(FIT);
  const [hiReady, setHiReady] = useState(false);
  const [hint, setHint] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ moved: boolean; start: View; sx: number; sy: number; dist?: number; mid?: { x: number; y: number } } | null>(null);

  // Scroll lock, initial focus, and focus back to whatever opened the viewer.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const t = setTimeout(() => setHint(false), 3500);
    return () => { document.body.style.overflow = prev; clearTimeout(t); opener?.focus?.(); };
  }, []);
  useEffect(() => { setView(FIT); setHiReady(false); }, [i]);

  /** Keep the plan from being dragged off-screen: content is the stage box scaled by s, anchored top-left. */
  const bound = useCallback((v: View): View => {
    const r = stage.current?.getBoundingClientRect();
    if (!r || v.s <= 1) return FIT;
    return { s: v.s, x: clamp(v.x, r.width * (1 - v.s), 0), y: clamp(v.y, r.height * (1 - v.s), 0) };
  }, []);
  /** Zoom to scale s keeping the stage point (px, py) fixed under the cursor/finger. */
  const zoomAt = useCallback((s: number, px: number, py: number, from: View) => {
    const ns = clamp(s, MIN, MAX), k = ns / from.s;
    return bound({ s: ns, x: px - (px - from.x) * k, y: py - (py - from.y) * k });
  }, [bound]);
  const centre = () => { const r = stage.current!.getBoundingClientRect(); return [r.width / 2, r.height / 2] as const; };
  const zoomBy = (f: number) => setView((v) => { const [cx, cy] = centre(); return zoomAt(v.s * f, cx, cy, v); });
  const go = useCallback((d: number) => { if (n > 1) onIndex((i + d + n) % n); }, [i, n, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") zoomBy(STEP);
      else if (e.key === "-") zoomBy(1 / STEP);
      else if (e.key === "0") setView(FIT);
      else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (view.s > 1) setView((v) => bound({ ...v, x: v.x + (e.key === "ArrowRight" ? -80 : 80) }));
        else go(e.key === "ArrowRight" ? 1 : -1);
      } else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && view.s > 1) setView((v) => bound({ ...v, y: v.y + (e.key === "ArrowDown" ? -80 : 80) }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, onClose, view.s, bound]);

  // Wheel zoom (non-passive so the page behind doesn't scroll).
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      setView((v) => zoomAt(v.s * Math.exp(-e.deltaY * 0.0022), e.clientX - r.left, e.clientY - r.top, v));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const local = (e: { clientX: number; clientY: number }) => { const r = stage.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, local(e));
    setHint(false);
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      const [a, b] = pts;
      gesture.current = { moved: true, start: view, sx: 0, sy: 0, dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
    } else gesture.current = { moved: false, start: view, sx: pts[0].x, sy: pts[0].y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, local(e));
    const g = gesture.current, pts = [...pointers.current.values()];
    if (pts.length >= 2 && g.dist && g.mid) {
      const [a, b] = pts;
      setView(zoomAt(g.start.s * (Math.hypot(a.x - b.x, a.y - b.y) / g.dist), g.mid.x, g.mid.y, g.start));
      return;
    }
    const dx = pts[0].x - g.sx, dy = pts[0].y - g.sy;
    if (!g.moved && Math.hypot(dx, dy) > 5) g.moved = true;
    if (g.moved && g.start.s > 1) setView(bound({ s: g.start.s, x: g.start.x + dx, y: g.start.y + dy }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current, p = pointers.current.get(e.pointerId);
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) { // one finger lifted mid-pinch: continue as a pan from here
      const rest = [...pointers.current.values()][0];
      gesture.current = { moved: true, start: view, sx: rest.x, sy: rest.y };
      return;
    }
    gesture.current = null;
    if (!g || !p) return;
    if (!g.moved) setView(view.s > 1 ? FIT : zoomAt(CLICK_ZOOM, p.x, p.y, view)); // tap/click toggles zoom at that point
    else if (g.start.s === 1 && view.s === 1 && n > 1 && Math.abs(p.x - g.sx) > 60) go(p.x < g.sx ? 1 : -1); // swipe between plans
  };

  const feed = isLockedOn(plan.src);
  // 2400px at the default quality is the rendition the importer pre-renders, so it arrives instantly.
  const hiSrc = feed ? lockedOnAt(plan.src, 2400) : plan.src;
  const zoomed = view.s > 1;
  const pct = Math.round(view.s * 100);

  return (
    <div className="lb fpv" role="dialog" aria-modal="true" aria-label={"Floor plan of " + title}>
      <div className="lb__bar">
        <div className="lb__title"><b>{title}</b>{subtitle ? <span>{subtitle}</span> : null}</div>
        <div className="lb__count" aria-live="polite">{n > 1 ? <>Plan <b>{i + 1}</b> / {n}</> : "Floor plan"}</div>
        <div className="lb__actions">
          <div className="fpv__zoom" role="group" aria-label="Zoom">
            <button type="button" className="lb__btn" onClick={() => zoomBy(1 / STEP)} disabled={view.s <= MIN} aria-label="Zoom out"><Svg d="M5 12h14" /></button>
            <button type="button" className="lb__btn lb__btn--text fpv__pct" onClick={() => setView(FIT)} aria-label="Fit to screen" title="Fit to screen">{zoomed ? pct + "%" : "Fit"}</button>
            <button type="button" className="lb__btn" onClick={() => zoomBy(STEP)} disabled={view.s >= MAX} aria-label="Zoom in"><Svg d="M12 5v14M5 12h14" /></button>
          </div>
          <button ref={closeRef} type="button" className="lb__btn" onClick={onClose} aria-label="Close floor plan"><Svg d="M6 6l12 12M18 6L6 18" /></button>
        </div>
      </div>

      <div
        ref={stage}
        className={"fpv__stage" + (zoomed ? " fpv__stage--zoomed" : "")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="fpv__canvas" style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})` }}>
          <Image key={plan.src} loader={loaderFor(plan.src)} src={plan.src} alt={"Floor plan" + (n > 1 ? " " + (i + 1) : "") + " for " + title} fill sizes="100vw" quality={85} priority style={{ objectFit: "contain" }} draggable={false} />
          {/* Sharper rendition, fetched only once the plan is zoomed; swapped in when decoded. */}
          {zoomed && feed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={hiSrc} src={hiSrc} alt="" aria-hidden="true" draggable={false} onLoad={() => setHiReady(true)} className="fpv__hi" style={{ opacity: hiReady ? 1 : 0 }} />
          ) : null}
        </div>
        {n > 1 && !zoomed ? (
          <>
            <button type="button" className="lb__nav lb__nav--l" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={() => go(-1)} aria-label="Previous plan"><Svg d="M15 5l-7 7 7 7" size={22} /></button>
            <button type="button" className="lb__nav lb__nav--r" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={() => go(1)} aria-label="Next plan"><Svg d="M9 5l7 7-7 7" size={22} /></button>
          </>
        ) : null}
        <div className={"fpv__hint" + (hint ? "" : " fpv__hint--off")} aria-hidden="true"><span className="fpv__hint-mouse">Click to zoom · scroll to zoom · drag to move</span><span className="fpv__hint-touch">Tap to zoom · pinch · drag to move</span></div>
      </div>
    </div>
  );
}
