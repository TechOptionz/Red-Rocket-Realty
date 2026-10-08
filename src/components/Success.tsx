import type { ReactNode } from "react";

export default function Success({ title, children, onReset, resetLabel = "Send another", light, style }: { title: string; children: ReactNode; onReset: () => void; resetLabel?: string; light?: boolean; style?: React.CSSProperties }) {
  return (
    <div className="success" style={style}>
      <div className="success__tick">✓</div>
      <div className="success__title">{title}</div>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: light ? "var(--grey-light)" : "var(--grey-2)", maxWidth: "40ch" }}>{children}</p>
      <button type="button" onClick={onReset} className={"pill pill--sm " + (light ? "pill--ghost-light" : "pill--ghost")} style={{ justifySelf: "start" }}>{resetLabel}</button>
    </div>
  );
}
