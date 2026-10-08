"use client";
import Link from "next/link";
import { CONTACT, PAGES } from "@/data/rr-data";
import { useLogo } from "@/lib/useLogo";

export default function Footer() {
  const { logo } = useLogo();
  return (
    <footer className="ftr">
      <div className="ftr__band">
        <div>
          <div className="kicker" style={{ letterSpacing: ".16em", marginBottom: 18 }}>Logan City and surrounding areas</div>
          <h2>Buying, selling or renting in Logan? Contact us now!</h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href={PAGES.contact} className="pill pill--white pill--lg pill--arrow"><span>Contact us</span><span className="pill__arrow" aria-hidden="true">→</span></Link>
          <a href={CONTACT.phoneHref} className="pill pill--ghost-light pill--lg">Call {CONTACT.phone}</a>
        </div>
      </div>
      <div className="ftr__grid">
        <div className="ftr__col" style={{ gap: 20 }}>
          <Link href={PAGES.home} aria-label="Red Rocket Realty home" style={{ display: "flex", alignItems: "center", color: "#fff", textDecoration: "none" }}>
            <img src={logo.dark} alt="Red Rocket Realty" style={{ width: "auto", height: logo.footerH }} />
          </Link>
          <p style={{ color: "var(--grey-light)", fontSize: 15, lineHeight: 1.55, maxWidth: "30ch" }}>Committed to the property needs of Logan residents. The local experts you can rely on and trust.</p>
          <div className="ftr__k" style={{ marginTop: 8 }}>Springwood | Underwood Real Estate</div>
        </div>
        <nav aria-label="Buy" className="ftr__col">
          <div className="ftr__k">Buy</div>
          <Link href={PAGES.listings + "?mode=buy"} className="ftr__link">Properties for sale</Link>
          <Link href={PAGES.listings + "?mode=land"} className="ftr__link">Land for sale</Link>
          <Link href={PAGES.openHomes} className="ftr__link">Open homes</Link>
          <Link href={PAGES.guides + "?guide=buyer"} className="ftr__link">Buyer guide</Link>
          <Link href={PAGES.guides + "?guide=buyer#offer"} className="ftr__link">Make an offer</Link>
          <Link href={PAGES.listings + "?mode=buy#alerts"} className="ftr__link">Property alerts</Link>
        </nav>
        <nav aria-label="Sell and rent" className="ftr__col">
          <div className="ftr__k">Sell</div>
          <Link href={PAGES.sell} className="ftr__link">Sell with Red Rocket</Link>
          <Link href={PAGES.appraisal} className="ftr__link">Request an appraisal</Link>
          <Link href={PAGES.listings + "?mode=sold"} className="ftr__link">Recently sold</Link>
          <Link href={PAGES.guides + "?guide=seller"} className="ftr__link">Seller guide</Link>
          <div className="ftr__k ftr__k--gap">Rent</div>
          <Link href={PAGES.listings + "?mode=rent"} className="ftr__link">Properties for rent</Link>
          <Link href={PAGES.rent + "#apply"} className="ftr__link">Apply for a property</Link>
          <Link href={PAGES.rent + "#maintenance"} className="ftr__link">Maintenance request</Link>
        </nav>
        <nav aria-label="About" className="ftr__col">
          <div className="ftr__k">Property management</div>
          <Link href={PAGES.pm} className="ftr__link">For landlords</Link>
          <Link href={PAGES.pm + "#rental-appraisal"} className="ftr__link">Rental appraisal</Link>
          <div className="ftr__k ftr__k--gap">About</div>
          <Link href={PAGES.about} className="ftr__link">Our story</Link>
          <Link href={PAGES.team} className="ftr__link">Our team</Link>
          <Link href={PAGES.about + "#reviews"} className="ftr__link">Reviews</Link>
        </nav>
        <div className="ftr__col">
          <div className="ftr__k">Office</div>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5 }}>67 Springwood Road<br />Springwood QLD 4127</div>
          <a href={CONTACT.phoneHref} className="ftr__link">{CONTACT.phone}</a>
          <a href={"mailto:" + CONTACT.email} className="ftr__mail">{CONTACT.email}</a>
          <a href={"mailto:" + CONTACT.inspections} className="ftr__mail">{CONTACT.inspections}</a>
          <div className="ftr__k ftr__k--gap">Property alerts</div>
          <form className="ftr__alert" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="ft-alert" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Email for property alerts</label>
            <input id="ft-alert" type="email" placeholder="Email address" />
            <button type="submit" aria-label="Subscribe">→</button>
          </form>
        </div>
      </div>
      <div className="ftr__legal">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
          <span>© 2026 Red Rocket Realty. All rights reserved.</span>
          <a href="https://redrocketrealty.com.au/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a>
          <a href="https://redrocketrealty.com.au/terms-of-use/" target="_blank" rel="noopener">Terms of Use</a>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={CONTACT.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="ftr__social">f</a>
          <a href={CONTACT.instagram} target="_blank" rel="noopener" aria-label="Instagram" className="ftr__social">ig</a>
          <a href={CONTACT.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn" className="ftr__social">in</a>
        </div>
      </div>
      <div aria-hidden="true" className="ftr__word-wrap">
        <div className="ftr__word" data-reveal="word">RED ROCKET</div>
      </div>
    </footer>
  );
}
