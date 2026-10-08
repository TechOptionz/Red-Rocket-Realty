import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LOGOS, PAGES } from "@/data/rr-data";

export const metadata: Metadata = { title: "Brand · logo files", description: "Red Rocket Realty logo set." };

const FILES: [string, string, string, boolean, string?][] = [
  ["Horizontal lockup", "1767×460", "/brand/logo-horizontal.png", false],
  ["Horizontal · dark", "used in header and footer", "/brand/logo-horizontal-dark.png", true],
  ["Stacked · original", "1300×1050", "/brand/logo-stacked.png", false, "min(340px,80%)"],
  ["Stacked · dark", "", "/brand/logo-stacked-dark.png", true, "min(340px,80%)"],
  ["Emblem only", "favicon and social avatar source", "/brand/logo-emblem.png", false, "min(200px,50%)"],
  ["Emblem · dark", "", "/brand/logo-emblem-dark.png", true, "min(200px,50%)"],
];

export default function BrandPage() {
  return (
    <>
      <Header solid />
      <main className="section--bg" style={{ padding: "150px var(--pad-x) var(--sec-y)" }}>
        <div style={{ display: "grid", gap: 40, maxWidth: 1240, margin: "0 auto" }}>
          <header style={{ display: "grid", gap: 12 }}>
            <div className="kicker">Brand · logo files</div>
            <h1 className="h2" style={{ lineHeight: 1 }}>Red Rocket Realty logo set.</h1>
            <p className="body" style={{ maxWidth: "70ch" }}>Cut from the supplied artwork, untouched apart from trimming. The dark versions swap navy for white so the mark sits on the site&apos;s charcoal header and footer; red stays red. All files are transparent PNGs. The header&apos;s logo picker switches between the {LOGOS.length} candidate marks below.</p>
          </header>
          <section className="logo-grid">
            {FILES.map(([title, meta, src, dark, width]) => (
              <figure key={src} {...(dark ? { "data-dark": "" } : {})} style={{ justifyItems: width ? "center" : "stretch" }}>
                <img src={src} alt={title} style={{ width: width || "100%", height: "auto" }} />
                <figcaption><span><strong style={{ color: dark ? "#fff" : "var(--ink)" }}>{title}</strong>{meta ? " · " + meta : ""}</span><a href={src} download>PNG</a></figcaption>
              </figure>
            ))}
          </section>
          <section style={{ display: "grid", gap: 16 }}>
            <div className="kicker">Candidate marks · header picker</div>
            <div className="logo-grid">
              {LOGOS.map((l) => (
                <figure key={l.id} data-dark="" style={{ alignContent: "center", justifyItems: "center" }}>
                  <img src={l.dark} alt={l.label} style={{ height: l.footerH, width: "auto" }} />
                  <figcaption><span><strong style={{ color: "#fff" }}>{l.label}</strong></span><a href={l.dark.split("?")[0]} download>PNG</a></figcaption>
                </figure>
              ))}
            </div>
          </section>
          <p className="small" style={{ fontSize: 13 }}>For print and large-format use, the artwork should still be redrawn as vectors by a designer; the PNG source is 1443 px wide. <Link href={PAGES.home}>Back to the homepage</Link>.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
