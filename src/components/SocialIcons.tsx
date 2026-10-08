import type { CSSProperties } from "react";

export type IconKind = "facebook" | "instagram" | "linkedin" | "email" | "phone";

/** Stroke icons (Lucide, ISC licence) so every social button shares one visual weight. */
export function SocialIcon({ kind, size = 16 }: { kind: IconKind; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, focusable: false };
  switch (kind) {
    case "facebook":
      return <svg {...common}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
    case "instagram":
      return <svg {...common}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>;
    case "linkedin":
      return <svg {...common}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>;
    case "email":
      return <svg {...common}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;
    case "phone":
      return <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
  }
}

export type SocialLinkItem = { kind: IconKind; href: string; label: string; external?: boolean };

/**
 * Row of round icon buttons. `variant` picks the colour scheme: light surfaces (default), dark surfaces,
 * or the footer. `owner` is folded into each aria-label ("Parnam Singh Heir on LinkedIn").
 */
export function SocialLinks({ links, owner, variant = "light", size = "md", className = "", style }: {
  links: SocialLinkItem[]; owner?: string; variant?: "light" | "dark"; size?: "sm" | "md"; className?: string; style?: CSSProperties;
}) {
  if (!links.length) return null;
  return (
    <div className={`social-row social-row--${size} ${className}`.trim()} style={style}>
      {links.map((l) => {
        const external = l.external ?? /^https?:/.test(l.href);
        return (
          <a key={l.kind + l.href} href={l.href} className={`social-btn social-btn--${variant}`} aria-label={owner ? `${owner} on ${l.label}` : l.label} title={l.label}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            <SocialIcon kind={l.kind} size={size === "sm" ? 15 : 17} />
          </a>
        );
      })}
    </div>
  );
}
