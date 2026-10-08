"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, NAV_TOP, NAV_CARDS, CONTACT, PAGES } from "@/data/rr-data";
import { useLogo } from "@/lib/useLogo";
import { SocialLinks } from "@/components/SocialIcons";
import Image from "next/image";
import { logoSize } from "@/data/brand-dims";
import Photo from "@/components/Photo";

const DESKTOP = "(min-width: 1181px)";

/**
 * Site header.
 * Desktop: floating bar with plain primary links; the Menu button drops a panel of photo cards under the bar.
 * Tablet/phone: the Menu button opens a full-screen list of every page.
 */
export default function Header({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // full-screen list (≤1180px)
  const [panel, setPanel] = useState(false); // desktop card panel, opened by the Menu button (≥1181px)
  const [cardsOn, setCardsOn] = useState(false); // mount the panel photos only once the panel has been opened
  const [logoOpen, setLogoOpen] = useState(false);
  const { logo, logos, setLogo } = useLogo();
  const pathname = usePathname();
  const wrap = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  const closeAll = useCallback(() => {
    setPanel(false);
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAll();
        setLogoOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!(t && t.closest && t.closest("[data-logo-wrap]"))) setLogoOpen(false);
      if (!(t && t.closest && t.closest("[data-hdr-wrap]"))) setPanel(false);
    };
    document.addEventListener("click", onDoc);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onDoc);
    };
  }, [closeAll]);

  // Close everything whenever the route changes (hash-only links close via onClick below).
  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  // Scroll-lock + focus management while the full-screen list is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) {
      const t = window.setTimeout(() => firstLink.current?.focus({ preventScroll: true }), 420);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const toggleMenuButton = () => {
    if (window.matchMedia(DESKTOP).matches) {
      setPanel((p) => !p);
      setCardsOn(true);
    } else {
      setMenuOpen((o) => {
        if (o) window.setTimeout(() => menuBtn.current?.focus({ preventScroll: true }), 0);
        return !o;
      });
    }
  };

  const isOpen = menuOpen || panel;
  const isSolid = solid || scrolled || isOpen;

  return (
    <>
      <div className="hdr-shell">
        <div ref={wrap} className="hdr-wrap" data-hdr-wrap onBlur={(e) => { if (!wrap.current?.contains(e.relatedTarget as Node | null)) setPanel(false); }}>
          <header className="hdr" data-solid={isSolid ? "1" : "0"} data-menu={menuOpen ? "1" : "0"} data-panel={panel ? "1" : "0"}>
            <div className="hdr__logo" data-logo-wrap>
              <Link href={PAGES.home} aria-label="Red Rocket Realty home" onClick={closeAll}>
                <Image src={logo.dark} alt="Red Rocket Realty" {...logoSize(logo.dark, logo.headerH)} priority style={{ height: logo.headerH, width: "auto" }} />
              </Link>
              <button type="button" className="logo-pick" aria-label="Choose logo" aria-expanded={logoOpen} title="Choose logo (client preview)" onClick={(e) => { e.stopPropagation(); setLogoOpen((o) => !o); }}>
                <span aria-hidden="true" />
              </button>
              {logoOpen && (
                <div className="logo-menu" role="listbox" aria-label="Logo options">
                  <div className="logo-menu__head">Choose logo</div>
                  {logos.map((l) => (
                    <button key={l.id} type="button" role="option" aria-selected={l.id === logo.id} className="logo-menu__opt" onClick={() => { setLogo(l.id); setLogoOpen(false); }}>
                      <span className="logo-menu__thumb"><Image src={l.dark} alt="" {...logoSize(l.dark, 32)} style={{ width: "auto", height: "auto" }} /></span>
                      <span>{l.label}</span>
                      <span className="logo-menu__radio" aria-hidden="true"><span /></span>
                    </button>
                  ))}
                  <div className="logo-menu__note">Applies site-wide · saved in this browser · remove picker before launch</div>
                </div>
              )}
            </div>

            <nav className="nav" aria-label="Primary">
              {NAV_TOP.map((n) => (
                <div className="nav__item" key={n.label}>
                  <Link href={n.href} className="nav__link" onClick={closeAll}>{n.label}</Link>
                </div>
              ))}
            </nav>

            <div className="hdr__right">
              <a className="hdr__phone" href={CONTACT.phoneHref}>{CONTACT.phone}</a>
              <Link href={PAGES.appraisal} className="pill pill--red pill--arrow hdr__cta" onClick={closeAll}>
                <span>Request an appraisal</span>
                <span className="pill__arrow" aria-hidden="true">→</span>
              </Link>
              <button ref={menuBtn} type="button" className="menu-btn" data-open={isOpen ? "1" : "0"} aria-label={isOpen ? "Close menu" : "Open menu"} aria-expanded={isOpen} aria-controls="mega-panel" onClick={toggleMenuButton}>
                <span className="menu-btn__label" aria-hidden="true">
                  <span>Menu</span>
                  <span>Close</span>
                </span>
                <span className="burger"><span /><span /></span>
              </button>
            </div>
          </header>

          {/* Desktop mega panel (Menu button): one photo card per group. */}
          <div id="mega-panel" className="mpanel" data-open={panel ? "1" : "0"} aria-hidden={!panel}>
            <div className="mpanel__box">
              <div className="mpanel__grid">
                {NAV_CARDS.map((n, i) => (
                  <div className="mcard" key={n.label} style={{ transitionDelay: panel ? 0.04 + i * 0.045 + "s" : "0s" }}>
                    <Link href={n.href} className="mcard__media" tabIndex={-1} aria-hidden="true" onClick={closeAll}>
                      <span className="mcard__photo">{cardsOn ? <Photo src={n.photo} sizes="(max-width: 1400px) 22vw, 300px" quality={65} /> : null}</span>
                    </Link>
                    <div className="mcard__body">
                      <Link href={n.href} className="mcard__title" onClick={closeAll}>{n.label}</Link>
                      <span className="mcard__dash" aria-hidden="true" />
                      <ul className="mcard__list">
                        {n.items.map(([label, href]) => (
                          <li key={label}><Link href={href} className="mcard__link" onClick={closeAll}>{label}</Link></li>
                        ))}
                      </ul>
                      <Link href={n.href} className="mcard__go" aria-label={"Go to " + n.label} onClick={closeAll}>→</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet / phone: full-screen list of every page. */}
      <div id="mega-menu" className="mega" data-open={menuOpen ? "1" : "0"} role="dialog" aria-modal="true" aria-label="Site menu" aria-hidden={!menuOpen}>
        <div className="mega__inner">
          <nav className="mega__cols" aria-label="All pages">
            {NAV.map((n, i) => (
              <div className="mega__col" key={n.label} data-mmi style={{ transitionDelay: 0.08 + i * 0.05 + "s" }}>
                <Link href={n.href} className="mega__head" onClick={closeAll} ref={i === 0 ? firstLink : undefined}>
                  {n.label}
                </Link>
                <ul className="mega__list">
                  {n.items.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="mega__link" onClick={closeAll}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mega__foot" data-mmi style={{ transitionDelay: ".4s" }}>
            <a href={CONTACT.phoneHref} className="mega__phone">{CONTACT.phone}</a>
            <a href={"mailto:" + CONTACT.email} className="mega__muted">{CONTACT.email}</a>
            <span className="mega__muted">{CONTACT.address}</span>
            <SocialLinks className="mega__social" variant="dark" owner="Red Rocket Realty" links={[
              { kind: "facebook", href: CONTACT.facebook, label: "Facebook" },
              { kind: "instagram", href: CONTACT.instagram, label: "Instagram" },
              { kind: "linkedin", href: CONTACT.linkedin, label: "LinkedIn" },
            ]} />
          </div>
        </div>
      </div>

      <div className="mbar" data-hidden={menuOpen ? "1" : "0"}>
        <a href={CONTACT.phoneHref} className="mbar__call">Call {CONTACT.phone}</a>
        <Link href={PAGES.appraisal} className="mbar__appraise">Free appraisal</Link>
      </div>
    </>
  );
}
