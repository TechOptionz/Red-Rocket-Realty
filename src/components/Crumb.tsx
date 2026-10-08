import Link from "next/link";
import { PAGES } from "@/data/rr-data";

type Item = [string, string?];

/** Breadcrumb. Items are [label, href?]; the last one has no href. Tone: default (grey on light), "light" (on dark hero), "dim" (on charcoal). */
export default function Crumb({ items, tone }: { items: Item[]; tone?: "light" | "dim" }) {
  return (
    <nav aria-label="Breadcrumb" className={"crumb" + (tone ? " crumb--" + tone : "")}>
      <Link href={PAGES.home}>Home</Link>
      {items.map(([label, href], i) => (
        <span key={i} style={{ display: "contents" }}>
          <span aria-hidden="true">/</span>
          {href ? <Link href={href}>{label}</Link> : <span>{label}</span>}
        </span>
      ))}
    </nav>
  );
}
