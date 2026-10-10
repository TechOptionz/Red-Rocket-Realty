"use client";
import { useState } from "react";

/** Share links for an article. The page URL is read on click so the buttons work wherever the site is deployed. */
export default function ShareBar({ title, light }: { title: string; light?: boolean }) {
  const [copied, setCopied] = useState(false);
  const url = () => (typeof window === "undefined" ? "" : window.location.href);
  const open = (build: (u: string, t: string) => string) => () => {
    window.open(build(encodeURIComponent(url()), encodeURIComponent(title)), "_blank", "noopener,width=640,height=560");
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url()); } catch { /* clipboard blocked: the URL bar still has it */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const cls = "pill pill--xs " + (light ? "pill--ghost-light" : "pill--ghost");
  return (
    <div className="share" aria-label="Share this article">
      <button type="button" className={cls} onClick={open((u) => "https://www.facebook.com/sharer/sharer.php?u=" + u)}>Facebook</button>
      <button type="button" className={cls} onClick={open((u) => "https://www.linkedin.com/sharing/share-offsite/?url=" + u)}>LinkedIn</button>
      <button type="button" className={cls} onClick={open((u, t) => "https://twitter.com/intent/tweet?url=" + u + "&text=" + t)}>X</button>
      <a className={cls} href={"mailto:?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(title + "\n")} onClick={(e) => { e.currentTarget.href = "mailto:?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(title + "\n" + url()); }}>Email</a>
      <button type="button" className={cls} onClick={copy} aria-live="polite">{copied ? "Copied ✓" : "Copy link"}</button>
    </div>
  );
}
