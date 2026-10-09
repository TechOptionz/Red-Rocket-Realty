"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type Props = {
  photos: string[];
  index: number;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onIndex: (i: number) => void;
};

const Chevron = ({ dir }: { dir: "l" | "r" }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === "l" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
  </svg>
);

/**
 * Full-screen photo viewer for a listing: slide view with filmstrip, or a grid of every photo.
 * Keyboard (arrows / Escape), swipe, scroll-lock and neighbour preloading are handled here so the
 * property page only tracks "which photo is open".
 */
export default function Lightbox({ photos, index, title, subtitle, onClose, onIndex }: Props) {
  const [view, setView] = useState<"slide" | "grid">("slide");
  const n = photos.length;
  const i = ((index % n) + n) % n;
  const go = useCallback((d: number) => onIndex((i + d + n) % n), [i, n, onIndex]);
  const stripRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock page scroll and focus the dialog while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (view === "grid") setView("slide"); else onClose(); }
      else if (view === "slide" && e.key === "ArrowRight") go(1);
      else if (view === "slide" && e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, view]);

  // Keep the active thumbnail in view on the filmstrip.
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>('[data-on="1"]');
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [i, view]);

  const onTouchStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  // Render the current photo plus its neighbours so the next swipe is already decoded.
  const slides = n === 1 ? [0] : n === 2 ? [i, (i + 1) % n] : [(i - 1 + n) % n, i, (i + 1) % n];

  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label={"Photos of " + title} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lb__bar">
        <div className="lb__title">
          <b>{title}</b>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
        <div className="lb__count" aria-live="polite">{view === "grid" ? n + " photos" : <><b>{i + 1}</b> / {n}</>}</div>
        <div className="lb__actions">
          {n > 1 ? (
            <button type="button" className="lb__btn lb__btn--text" onClick={() => setView(view === "grid" ? "slide" : "grid")} aria-pressed={view === "grid"}>
              {view === "grid" ? "Back to photo" : "All photos"}
            </button>
          ) : null}
          <button ref={closeRef} type="button" className="lb__btn" onClick={onClose} aria-label="Close gallery">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="lb__grid">
          {photos.map((src, k) => (
            <button key={src + k} type="button" className="lb__cell" data-on={k === i ? "1" : "0"} onClick={() => { onIndex(k); setView("slide"); }} aria-label={"Photo " + (k + 1)}>
              <Image src={src} alt="" fill sizes="(max-width: 720px) 50vw, (max-width: 1200px) 33vw, 25vw" quality={70} style={{ objectFit: "cover" }} draggable={false} />
              <span className="lb__cell-n">{k + 1}</span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="lb__stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            {slides.map((k) => (
              <div key={photos[k] + k} className="lb__slide" data-on={k === i ? "1" : "0"} aria-hidden={k !== i}>
                <Image src={photos[k]} alt={k === i ? title + " – photo " + (k + 1) + " of " + n : ""} fill sizes="100vw" quality={85} priority={k === i} style={{ objectFit: "contain" }} draggable={false} />
              </div>
            ))}
            {n > 1 ? (
              <>
                <button type="button" className="lb__nav lb__nav--l" onClick={() => go(-1)} aria-label="Previous photo"><Chevron dir="l" /></button>
                <button type="button" className="lb__nav lb__nav--r" onClick={() => go(1)} aria-label="Next photo"><Chevron dir="r" /></button>
              </>
            ) : null}
          </div>
          {n > 1 ? (
            <div ref={stripRef} className="lb__strip" role="tablist" aria-label="Photo thumbnails">
              {photos.map((src, k) => (
                <button key={src + k} type="button" role="tab" aria-selected={k === i} className="lb__thumb" data-on={k === i ? "1" : "0"} onClick={() => onIndex(k)} aria-label={"Photo " + (k + 1)}>
                  <Image src={src} alt="" fill sizes="112px" quality={70} style={{ objectFit: "cover" }} draggable={false} />
                </button>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
