import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PAGES } from "@/data/rr-data";

export default function NotFound() {
  return (
    <>
      <Header solid />
      <main className="section--bg" style={{ padding: "180px var(--pad-x) var(--sec-y)", minHeight: "70vh" }}>
        <div style={{ display: "grid", gap: 20, maxWidth: 560 }}>
          <div className="kicker">404</div>
          <h1 className="display-lg">Lost in orbit.</h1>
          <p className="lead">That page isn&apos;t here. Head back to mission control or search the current listings.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href={PAGES.home} className="pill pill--dark">Back home</Link>
            <Link href={PAGES.listings + "?mode=buy"} className="pill pill--ghost">Properties for sale</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
