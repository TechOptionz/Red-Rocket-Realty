"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV, NAV_TOP, NAV_COLS, NAV_SEARCH_MODES, SEARCH_MODE_NOUN, HOURS, CONTACT, PAGES, SALE, POSTS, postDate, specs, propHref, suburbCounts, matchSuburb, type SearchMode } from "@/data/rr-data";
import { useLogo } from "@/lib/useLogo";
import { SocialLinks } from "@/components/SocialIcons";
import Image from "next/image";
import { logoRatio, logoSize } from "@/data/brand-dims";
import Photo from "@/components/Photo";
import MenuCarousel, { type CarouselSlide } from "@/components/MenuCarousel";

const DESKTOP = "(min-width: 1181px)";
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * Site header.
 * Desktop (≥1181px): floating bar with plain primary links; the Menu button drops a full mega menu under the bar (quick property
 * search, one link column per group, a feature rail with the featured listing and latest news, and an office strip).
 * Tablet/phone (≤1180px): the Menu button opens a purpose-built panel (full-screen on phones, right-hand drawer on
 * tablets) with accordion sections, one featured listing, the appraisal CTA and contact details.
 */
export default function Header({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // mobile panel (≤1180px)
  const [panel, setPanel] = useState(false); // desktop card panel, opened by the Menu button (≥1181px)
  const [cardsOn, setCardsOn] = useState(false); // mount the panel photos only once the panel has been opened
  const [qMode, setQMode] = useState<SearchMode>("buy"); // mega menu quick search
  const [qSuburb, setQSuburb] = useState("");
  const [qOpen, setQOpen] = useState(false); // suburb suggestions open
  const [qIdx, setQIdx] = useState(-1); // keyboard-highlighted suggestion
  const [qMiss, setQMiss] = useState(false); // submitted text that matches no suburb with listings
  const qInput = useRef<HTMLInputElement>(null);
  const [mobileOn, setMobileOn] = useState(false); // mount the mobile panel's photo only once it has been opened
  const [logoOpen, setLogoOpen] = useState(false);
  const [desktop, setDesktop] = useState(true);
  const [sec, setSec] = useState<string | null>(null); // open accordion section (mobile)
  const [loc, setLoc] = useState(""); // pathname + search + hash, read when the mobile panel opens (drives active states)
  const { logo, logos, setLogo } = useLogo();
  const pathname = usePathname();
  const router = useRouter();
  const wrap = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const mobilePanel = useRef<HTMLDivElement>(null);
  const firstBtn = useRef<HTMLButtonElement>(null);
  const featured = SALE.find((p) => p.photo);
  // Feature rail carousels (desktop mega menu): up to four photographed listings and the four latest posts.
  const featSlides: CarouselSlide[] = SALE.filter((p) => p.photo).slice(0, 4).map((p) => ({
    key: p.id, href: propHref(p), photo: p.photo!, badge: p.status || "For sale", title: p.address + ", " + p.suburb,
    meta: [p.price, p.type !== "Land" ? specs(p).join(" · ") : p.land ? p.land + " land" : ""].filter(Boolean).join(" · "),
  }));
  const newsSlides: CarouselSlide[] = POSTS.slice(0, 4).map((p) => ({ key: p.slug, href: p.href, photo: p.photo, position: p.position, badge: p.topic, title: p.title, meta: postDate(p.date) }));

  const closeAll = useCallback(() => {
    setPanel(false);
    setMenuOpen(false);
  }, []);

  const closeMobile = useCallback((returnFocus = true) => {
    setMenuOpen(false);
    if (returnFocus) window.setTimeout(() => menuBtn.current?.focus({ preventScroll: true }), 0);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel(false);
        setLogoOpen(false);
        setMenuOpen((o) => {
          if (o) window.setTimeout(() => menuBtn.current?.focus({ preventScroll: true }), 0);
          return false;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!(t && t.closest && t.closest("[data-logo-wrap]"))) setLogoOpen(false);
      if (!(t && t.closest && t.closest("[data-hdr-wrap]"))) setPanel(false);
    };
    document.addEventListener("click", onDoc);
    // Track the breakpoint so the one Menu button points at the right panel, and close the mobile panel if the viewport grows past it.
    const mq = window.matchMedia(DESKTOP);
    const onMq = () => {
      setDesktop(mq.matches);
      if (mq.matches) setMenuOpen(false);
      else setPanel(false);
    };
    onMq();
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onDoc);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  // Close everything whenever the route changes (hash-only links close via onClick below).
  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  // Mobile panel: scroll lock without layout shift, focus management and a Tab trap while open.
  useEffect(() => {
    if (!menuOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const y = window.scrollY;
    const sbw = window.innerWidth - html.clientWidth; // 0 on touch devices with overlay scrollbars
    html.style.setProperty("--sbw", sbw + "px");
    body.style.top = -y + "px"; // CSS pins the body (position: fixed) so iOS cannot scroll the page behind the panel
    html.setAttribute("data-nav-lock", "1");
    setMobileOn(true);
    try {
      const l = window.location;
      setLoc(l.pathname + l.search + l.hash);
    } catch {}
    const t = window.setTimeout(() => firstBtn.current?.focus({ preventScroll: true }), 320);
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !mobilePanel.current) return;
      const inside = Array.from(mobilePanel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      const list = menuBtn.current ? [menuBtn.current, ...inside] : inside;
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !list.includes(active as HTMLElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onTab);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onTab);
      html.removeAttribute("data-nav-lock");
      html.style.removeProperty("--sbw");
      body.style.top = "";
      // Put the page back where it was, instantly (html has scroll-behavior: smooth).
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, y);
      html.style.scrollBehavior = prev;
    };
  }, [menuOpen]);

  // When the mobile panel opens, expand the section that holds the current page.
  useEffect(() => {
    if (!menuOpen) return;
    const path = loc.split(/[?#]/)[0];
    const hit = NAV.find((n) => n.items.some(([, href]) => isActive(href, loc)) || n.href.split(/[?#]/)[0] === path);
    setSec(hit ? hit.label : null);
  }, [menuOpen, loc]);

  const toggleMenuButton = () => {
    if (window.matchMedia(DESKTOP).matches) {
      setPanel((p) => !p);
      setCardsOn(true);
    } else if (menuOpen) {
      closeMobile();
    } else {
      setMenuOpen(true);
    }
  };

  // Quick search: only suburbs that currently have a listing in the selected tab are offered, so a search never lands on an empty page.
  const qAll = suburbCounts(qMode);
  const qText = qSuburb.trim().toLowerCase();
  const qHits = qText ? qAll.filter((s) => s.name.toLowerCase().includes(qText)) : qAll;
  const qNoun = SEARCH_MODE_NOUN[qMode];
  const goQuick = (suburb?: string) => {
    const q = new URLSearchParams({ mode: qMode });
    if (suburb) q.set("suburb", suburb);
    setQOpen(false);
    setQIdx(-1);
    setQMiss(false);
    closeAll();
    router.push(PAGES.listings + "?" + q.toString());
  };
  const submitQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText) return goQuick();
    const hit = (qIdx >= 0 && qHits[qIdx]?.name) || matchSuburb(qMode, qSuburb);
    if (hit) return goQuick(hit);
    setQMiss(true);
    setQOpen(true);
    qInput.current?.focus();
  };
  const pickMode = (m: SearchMode) => { setQMode(m); setQIdx(-1); setQMiss(false); };
  const onQKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!qHits.length) return;
      setQOpen(true);
      setQIdx((i) => (e.key === "ArrowDown" ? (i + 1) % qHits.length : (i - 1 + qHits.length) % qHits.length));
    } else if (e.key === "Escape" && qOpen) {
      e.stopPropagation();
      setQOpen(false);
      setQIdx(-1);
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
                <Image src={logo.dark} alt="Red Rocket Realty" {...logoSize(logo.dark, logo.headerH)} priority style={{ height: logo.headerH, width: "auto", ...logoRatio(logo.dark, logo.headerH) }} />
              </Link>
              <button type="button" className="logo-pick" aria-label="Choose logo" aria-expanded={logoOpen} title="Choose logo (client preview)" onClick={(e) => { e.stopPropagation(); setLogoOpen((o) => !o); }}>
                <span aria-hidden="true" />
              </button>
              {logoOpen && (
                <div className="logo-menu" role="listbox" aria-label="Logo options">
                  <div className="logo-menu__head">Choose logo</div>
                  {logos.map((l) => (
                    <button key={l.id} type="button" role="option" aria-selected={l.id === logo.id} className="logo-menu__opt" onClick={() => { setLogo(l.id); setLogoOpen(false); }}>
                      <span className="logo-menu__thumb"><Image src={l.dark} alt="" {...logoSize(l.dark, 32)} style={{ width: "auto", height: "auto", ...logoRatio(l.dark, 32) }} /></span>
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
              <a href={CONTACT.phoneHref} className="hdr__icon hdr__call" aria-label={"Call " + CONTACT.phone} title={"Call " + CONTACT.phone}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2z" /></svg>
              </a>
              <button ref={menuBtn} type="button" className="menu-btn" data-open={isOpen ? "1" : "0"} aria-label={isOpen ? "Close menu" : "Open menu"} aria-expanded={isOpen} aria-controls={desktop ? "mega-panel" : "mobile-menu"} aria-haspopup="dialog" onClick={toggleMenuButton}>
                <span className="menu-btn__label" aria-hidden="true">
                  <span>Menu</span>
                  <span>Close</span>
                </span>
                <span className="burger"><span /><span /></span>
              </button>
            </div>
          </header>

          {/* Desktop mega menu (Menu button): quick search, one link column per group, feature rail and office strip. */}
          <div className="mpanel__veil" data-open={panel ? "1" : "0"} aria-hidden="true" onClick={() => setPanel(false)} />
          <div id="mega-panel" className="mpanel" data-open={panel ? "1" : "0"} aria-hidden={!panel}>
            <div className="mpanel__box">
              <form className="mpanel__search" role="search" aria-label="Quick property search" onSubmit={submitQuick}>
                <div className="mpanel__tabs" role="tablist" aria-label="Search type">
                  {NAV_SEARCH_MODES.map(([m, label]) => (
                    <button key={m} type="button" role="tab" aria-selected={qMode === m} className="mpanel__tab" data-on={qMode === m ? "1" : "0"} onClick={() => pickMode(m)}>{label}</button>
                  ))}
                </div>
                <div className="mpanel__combo" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) { setQOpen(false); setQIdx(-1); } }}>
                  <label className="mpanel__field" data-miss={qMiss ? "1" : "0"}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                    <input ref={qInput} type="text" name="suburb" autoComplete="off" value={qSuburb} onChange={(e) => { setQSuburb(e.target.value); setQOpen(true); setQIdx(-1); setQMiss(false); }} onFocus={() => setQOpen(true)} onKeyDown={onQKey}
                      placeholder={"Search by suburb, e.g. " + (qAll[0]?.name || "Springwood")} aria-label="Suburb" role="combobox" aria-expanded={qOpen} aria-controls="mega-suburbs" aria-autocomplete="list" aria-activedescendant={qIdx >= 0 ? "mega-suburb-" + qIdx : undefined} />
                    {qSuburb && <button type="button" className="mpanel__clear" aria-label="Clear suburb" onClick={() => { setQSuburb(""); setQIdx(-1); setQMiss(false); qInput.current?.focus(); }}>&times;</button>}
                  </label>
                  <div id="mega-suburbs" className="mpanel__sugg" data-open={qOpen ? "1" : "0"} role="listbox" aria-label={"Suburbs with properties " + qNoun} onMouseDown={(e) => e.preventDefault()}>
                    {qHits.length ? qHits.map((s, i) => (
                      <button key={s.name} id={"mega-suburb-" + i} type="button" role="option" aria-selected={qIdx === i} data-on={qIdx === i ? "1" : "0"} onClick={() => goQuick(s.name)}>
                        <span>{s.name}</span>
                        <span>{s.count} {qNoun}</span>
                      </button>
                    )) : (
                      <p className="mpanel__sugg-none" role="status">No properties {qNoun} in &ldquo;{qSuburb.trim()}&rdquo; right now. Try one of the suburbs below, or search all {qAll.length} suburbs with properties {qNoun}.</p>
                    )}
                  </div>
                </div>
                <button type="submit" className="mpanel__go">
                  <span>Search</span>
                  <span aria-hidden="true">→</span>
                </button>
                <div className="mpanel__chips">
                  <span>{qMode === "sold" ? "Recently sold in" : "Available in"}</span>
                  {qAll.slice(0, 9).map((s) => (
                    <Link key={s.name} href={PAGES.listings + "?mode=" + qMode + "&suburb=" + encodeURIComponent(s.name)} className="mpanel__chip" onClick={closeAll}>{s.name}<small>{s.count}</small></Link>
                  ))}
                  <Link href={PAGES.listings + "?mode=" + qMode} className="mpanel__chip mpanel__chip--all" onClick={closeAll}>All {qNoun}</Link>
                </div>
              </form>

              <div className="mpanel__cols">
                {NAV_COLS.map((n, i) => (
                  <div className="mcol" key={n.label} style={{ transitionDelay: panel ? 0.04 + i * 0.04 + "s" : "0s" }}>
                    <Link href={n.href} className="mcol__title" onClick={closeAll}>
                      {n.label}
                      <span aria-hidden="true">→</span>
                    </Link>
                    <p className="mcol__blurb">{n.blurb}</p>
                    <ul className="mcol__list">
                      {n.items.map(([label, href, note]) => {
                        const ext = /^(mailto|tel):/.test(href);
                        const inner = <>{label}{note ? <span className="mcol__note">{note}</span> : null}</>;
                        return (
                          <li key={label}>
                            {ext
                              ? <a href={href} className="mcol__link" onClick={closeAll}>{inner}</a>
                              : <Link href={href} className="mcol__link" onClick={closeAll}>{inner}</Link>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}

                <aside className="mrail" aria-label="Featured" style={{ transitionDelay: panel ? ".26s" : "0s" }}>
                  <MenuCarousel label="Featured properties" slides={featSlides} viewAll="View all" viewAllHref={PAGES.listings + "?mode=buy"} every={6000} active={panel} mountPhotos={cardsOn} onNavigate={closeAll} />
                  <MenuCarousel label="Latest news" slides={newsSlides} viewAll="View all" viewAllHref={PAGES.blog} every={5000} active={panel} mountPhotos={cardsOn} onNavigate={closeAll} />
                </aside>
              </div>

              <div className="mpanel__foot">
                <div className="mpanel__office">
                  <a href={CONTACT.phoneHref} className="mpanel__tel">{CONTACT.phone}</a>
                  <div className="mpanel__addr">
                    <a href={"mailto:" + CONTACT.email}>{CONTACT.email}</a>
                    <span>{CONTACT.address}</span>
                    <span>{HOURS}</span>
                  </div>
                </div>
                <div className="mpanel__actions">
                  <SocialLinks variant="dark" size="sm" owner="Red Rocket Realty" links={[
                    { kind: "facebook", href: CONTACT.facebook, label: "Facebook" },
                    { kind: "instagram", href: CONTACT.instagram, label: "Instagram" },
                    { kind: "linkedin", href: CONTACT.linkedin, label: "LinkedIn" },
                  ]} />
                  <Link href={PAGES.pm + "#rental-appraisal"} className="pill pill--ghost-light pill--sm" onClick={closeAll}>Free rental appraisal</Link>
                  <Link href={PAGES.appraisal} className="pill pill--red pill--sm pill--arrow" onClick={closeAll}>
                    <span>Request an appraisal</span>
                    <span className="pill__arrow" aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet / phone panel: accordion sections, one featured listing, the appraisal CTA and contact details. */}
      <div id="mobile-menu" className="mnav" data-open={menuOpen ? "1" : "0"} role="dialog" aria-modal="true" aria-label="Site menu" aria-hidden={!menuOpen}>
        <div className="mnav__backdrop" aria-hidden="true" onClick={() => closeMobile()} />
        <div ref={mobilePanel} className="mnav__panel">
          <div className="mnav__scroll">
            <nav className="mnav__nav" aria-label="Primary">
              <ul className="mnav__list">
                {NAV.map((n, i) => {
                  const id = "mnav-" + slugify(n.label);
                  const open = sec === n.label;
                  const current = n.items.some(([, href]) => isActive(href, loc)) || n.href.split(/[?#]/)[0] === loc.split(/[?#]/)[0];
                  const direct = n.label === "Contact";
                  return (
                    <li key={n.label} className="mnav__sec" data-open={open ? "1" : "0"} data-current={current ? "1" : "0"} data-mmi style={{ transitionDelay: menuOpen ? 0.06 + i * 0.04 + "s" : "0s" }}>
                      {direct ? (
                        <Link href={n.href} className="mnav__btn mnav__btn--link" onClick={closeAll} aria-current={current ? "page" : undefined}>
                          <span className="mnav__label">{n.label}</span>
                          <span className="mnav__arrow" aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <>
                          <button ref={i === 0 ? firstBtn : undefined} type="button" id={id + "-btn"} className="mnav__btn" aria-expanded={open} aria-controls={id} onClick={() => setSec(open ? null : n.label)}>
                            <span className="mnav__label">{n.label}</span>
                            <span className="mnav__chev" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></span>
                          </button>
                          <div id={id} role="region" aria-labelledby={id + "-btn"} className="mnav__sub">
                            <div>
                              <ul className="mnav__sublist">
                                {n.items.map(([label, href]) => {
                                  const act = isActive(href, loc);
                                  const ext = /^(mailto|tel):/.test(href);
                                  return (
                                    <li key={label}>
                                      {ext
                                        ? <a href={href} className="mnav__link" onClick={closeAll} tabIndex={open ? 0 : -1}>{label}</a>
                                        : <Link href={href} className="mnav__link" onClick={closeAll} aria-current={act ? "page" : undefined} tabIndex={open ? 0 : -1}>{label}</Link>}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {featured ? (
              <Link href={propHref(featured)} className="mnav__feat" onClick={closeAll} data-mmi style={{ transitionDelay: menuOpen ? ".32s" : "0s" }}>
                <span className="mnav__feat-img">{mobileOn ? <Photo src={featured.photo!} sizes="112px" quality={70} /> : null}</span>
                <span className="mnav__feat-body">
                  <span className="mnav__feat-k">Featured · {featured.status || "For sale"}</span>
                  <span className="mnav__feat-t">{featured.address}, {featured.suburb}</span>
                  <span className="mnav__feat-p">{featured.price}</span>
                </span>
                <span className="mnav__arrow" aria-hidden="true">→</span>
              </Link>
            ) : null}

            <div className="mnav__cta" data-mmi style={{ transitionDelay: menuOpen ? ".36s" : "0s" }}>
              <Link href={PAGES.appraisal} className="pill pill--red pill--arrow mnav__appraise" onClick={closeAll}>
                <span>Request an appraisal</span>
                <span className="pill__arrow" aria-hidden="true">→</span>
              </Link>
              <a href={CONTACT.phoneHref} className="pill pill--ghost-light mnav__call">Call {CONTACT.phone}</a>
            </div>

            <div className="mnav__foot" data-mmi style={{ transitionDelay: menuOpen ? ".4s" : "0s" }}>
              <a href={"mailto:" + CONTACT.email} className="mnav__muted">{CONTACT.email}</a>
              <span className="mnav__muted">{CONTACT.address}</span>
              <SocialLinks className="mnav__social" variant="dark" owner="Red Rocket Realty" links={[
                { kind: "facebook", href: CONTACT.facebook, label: "Facebook" },
                { kind: "instagram", href: CONTACT.instagram, label: "Instagram" },
                { kind: "linkedin", href: CONTACT.linkedin, label: "LinkedIn" },
              ]} />
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

/** A nav link is "current" when it matches the page exactly (path + query, plus the hash when the link has one). */
function isActive(href: string, loc: string): boolean {
  if (!loc || /^(mailto|tel):/.test(href)) return false;
  if (href.includes("#")) return href === loc;
  return href === loc.split("#")[0];
}
