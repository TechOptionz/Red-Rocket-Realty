"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV, CONTACT, PAGES } from "@/data/rr-data";
import { useLogo } from "@/lib/useLogo";

export default function Header({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoOpen, setLogoOpen] = useState(false);
  const { logo, logos, setLogo } = useLogo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setLogoOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!(t && t.closest && t.closest("[data-logo-wrap]"))) setLogoOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onDoc);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isSolid = solid || scrolled || menuOpen;
  const close = () => setMenuOpen(false);

  return (
    <>
      <div className="hdr-shell">
        <header className="hdr" data-solid={isSolid ? "1" : "0"}>
          <div className="hdr__logo" data-logo-wrap>
            <Link href={PAGES.home} aria-label="Red Rocket Realty home">
              <img src={logo.dark} alt="Red Rocket Realty" style={{ height: logo.headerH }} />
            </Link>
            <button type="button" className="logo-pick" aria-label="Choose logo" aria-expanded={logoOpen} title="Choose logo (client preview)" onClick={(e) => { e.stopPropagation(); setLogoOpen((o) => !o); }}>
              <span aria-hidden="true" />
            </button>
            {logoOpen && (
              <div className="logo-menu" role="listbox" aria-label="Logo options">
                <div className="logo-menu__head">Choose logo</div>
                {logos.map((l) => (
                  <button key={l.id} type="button" role="option" aria-selected={l.id === logo.id} className="logo-menu__opt" onClick={() => { setLogo(l.id); setLogoOpen(false); }}>
                    <span className="logo-menu__thumb"><img src={l.dark} alt="" /></span>
                    <span>{l.label}</span>
                    <span className="logo-menu__radio" aria-hidden="true"><span /></span>
                  </button>
                ))}
                <div className="logo-menu__note">Applies site-wide · saved in this browser · remove picker before launch</div>
              </div>
            )}
          </div>

          <nav className="nav" aria-label="Primary">
            {NAV.map((n) => (
              <div className="nav__item" key={n.label}>
                <Link href={n.href} className="nav__link">
                  {n.label}
                  <span aria-hidden="true" />
                </Link>
                {n.items.length > 0 && (
                  <div className="menu">
                    <div className="menu__head">{n.label}</div>
                    {n.items.map(([label, href], j) => (
                      <Link key={label} href={href} className="menu__item" style={{ transitionDelay: 0.04 + j * 0.04 + "s" }}>
                        {label}
                        <span aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hdr__right">
            <a className="hdr__phone" href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            <Link href={PAGES.appraisal} className="pill pill--white pill--arrow hdr__cta">
              <span>Request an appraisal</span>
              <span className="pill__arrow" aria-hidden="true">→</span>
            </Link>
            <button type="button" className="hdr__icon hdr__burger" data-open={menuOpen ? "1" : "0"} aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
              <span className="burger"><span /><span /></span>
            </button>
          </div>
        </header>
      </div>

      <div className="mbar">
        <a href={CONTACT.phoneHref} className="mbar__call">Call {CONTACT.phone}</a>
        <Link href={PAGES.appraisal} className="mbar__appraise">Free appraisal</Link>
      </div>

      <div className="mm" data-open={menuOpen ? "1" : "0"} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!menuOpen}>
        <div className="mm__grid">
          <nav aria-label="Mobile" style={{ display: "grid", gap: 4, alignContent: "start" }}>
            {NAV.map((n, i) => (
              <Link key={n.label} href={n.href} className="mm__link" data-mmi onClick={close} style={{ transitionDelay: 0.08 + i * 0.06 + "s" }}>
                <span>{n.label}</span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
          <div style={{ display: "grid", gap: 28, alignContent: "start" }}>
            <Link href={PAGES.appraisal} data-mmi onClick={close} className="pill pill--red pill--arrow pill--lg" style={{ transitionDelay: ".3s", justifyContent: "space-between" }}>
              <span>Request an appraisal</span>
              <span className="pill__arrow" aria-hidden="true">→</span>
            </Link>
            <div data-mmi style={{ display: "grid", gap: 10, transitionDelay: ".36s" }}>
              <div className="mm__k">Mission control</div>
              <a href={CONTACT.phoneHref} className="mm__phone">{CONTACT.phone}</a>
              <a href={"mailto:" + CONTACT.email} className="mm__muted">{CONTACT.email}</a>
              <div className="mm__muted">67 Springwood Road<br />Springwood QLD 4127</div>
            </div>
            <div data-mmi style={{ display: "flex", flexWrap: "wrap", gap: 8, transitionDelay: ".42s" }}>
              <a href={CONTACT.facebook} target="_blank" rel="noopener" className="pill pill--ghost-light pill--sm">Facebook</a>
              <a href={CONTACT.instagram} target="_blank" rel="noopener" className="pill pill--ghost-light pill--sm">Instagram</a>
              <a href={CONTACT.linkedin} target="_blank" rel="noopener" className="pill pill--ghost-light pill--sm">LinkedIn</a>
            </div>
            <div data-mmi style={{ display: "flex", flexWrap: "wrap", gap: 18, transitionDelay: ".48s" }}>
              <Link href={PAGES.rent + "#maintenance"} className="mm__small" onClick={close}>Maintenance request</Link>
              <a href={CONTACT.form22} target="_blank" rel="noopener" className="mm__small">Rental application</a>
              <Link href={PAGES.listings + "?mode=buy#alerts"} className="mm__small" onClick={close}>Property alerts</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
