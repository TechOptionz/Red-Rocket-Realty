import type { ReactNode, ElementType } from "react";

/** Heading whose lines rise in from below when scrolled into view (data-reveal="lines"). */
export default function Lines({ as: Tag = "h2", lines, className, style }: { as?: ElementType; lines: ReactNode[]; className?: string; style?: React.CSSProperties }) {
  return (
    <Tag data-reveal="lines" className={className} style={style}>
      {lines.map((l, i) => (
        <span key={i}><span>{l}</span></span>
      ))}
    </Tag>
  );
}
