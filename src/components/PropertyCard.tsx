import Link from "next/link";
import { decorate, formatRent, propHref, type Listing } from "@/data/rr-data";

type Props = {
  p: Listing;
  ratio?: string;
  light?: boolean;
  width?: string;
  showMeta?: boolean;
  specsCount?: number;
  priceOverride?: string;
  style?: React.CSSProperties;
  addrFormat?: "full" | "suburb-type";
};

const ICON = {
  bed: <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 15h18M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M3 18v1M21 18v1" />,
  bath: <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2" />,
  car: <path d="M5 16h14M6 16v2M18 16v2M4 12l1.5-4.5A2 2 0 0 1 7.4 6h9.2a2 2 0 0 1 1.9 1.5L20 12v4H4v-4ZM7.5 13.5h.01M16.5 13.5h.01" />,
  land: <path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-5h6v5" />,
  cal: <path d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM4 10h16M8 3v4M16 3v4" />,
  key: <path d="M14 10a4 4 0 1 1-1.2-2.9L21 2m-3 3 2 2m-5 1 2 2" />,
};
const Icon = ({ k }: { k: keyof typeof ICON }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON[k]}</svg>
);

/** Standard listing card: contained surface, floating status badge, icon specs, price and address hierarchy. */
export default function PropertyCard({ p, ratio = "3/2", light, width, showMeta, specsCount, priceOverride, style, addrFormat = "full" }: Props) {
  const d = decorate(p);
  const isRent = !!p.rent;
  const isLand = p.type === "Land";
  const priceText = priceOverride ?? (isRent ? formatRent(p.rent!) : p.price);
  const badge = p.status ? p.status : null;
  const badgeMod = p.status === "Sold" ? " card__badge--sold" : p.status === "New" ? " card__badge--new" : "";
  const specItems: { k: keyof typeof ICON; n: string | number; label: string }[] = isLand
    ? [{ k: "land", n: p.land || "", label: "land" }]
    : [{ k: "bed", n: p.beds, label: "bed" }, { k: "bath", n: p.baths, label: "bath" }, { k: "car", n: p.cars, label: "car" }];
  const shown = specsCount ? specItems.slice(0, specsCount) : specItems;
  const addrMain = addrFormat === "full" ? p.address : p.suburb;
  const addrSub = addrFormat === "full" ? p.suburb + (p.postcode ? " QLD " + p.postcode : "") : (p.type || "");
  const availNow = /now/i.test(p.available || "");
  return (
    <Link data-card href={propHref(p)} className={"card" + (light ? " card--light" : "")} style={{ width, ...style }}>
      <div className="card__media" style={{ aspectRatio: ratio }}>
        <div data-zoom className="card__img" style={{ backgroundColor: p.shade, backgroundImage: d.bgImage }}>
          {d.imgTag ? (<><span>{d.imgTag}</span><br /><span>{d.img}</span></>) : null}
        </div>
        <div className="card__shade" aria-hidden="true" />
        {badge ? <span className={"card__badge" + badgeMod}><i aria-hidden="true" />{badge}</span> : null}
        {p.type && !badge ? <span className="card__chip">{p.type}</span> : null}
        {p.type && badge ? <span className="card__chip card__chip--r">{p.type}</span> : null}
        <span data-arrow className="card__arrow card__arrow--fill" aria-hidden="true">→</span>
      </div>
      <div className="card__body">
        <div className="card__top">
          <div className="card__price">{priceText}</div>
          {isRent ? <span className="card__per">Weekly rent</span> : null}
        </div>
        <div className="card__addr">{addrMain}</div>
        <div className="card__sub">{addrSub}</div>
        <div className="card__specs">
          {shown.map((s) => (
            <span key={s.k} className="card__spec" title={s.n + " " + s.label}>
              <Icon k={s.k} /><b>{s.n}</b><span className="sr-only"> {s.label}</span>
            </span>
          ))}
        </div>
        {showMeta && (p.available || p.inspection) ? (
          <div className="card__foot">
            {p.available ? <span className={"card__pill" + (availNow ? " card__pill--now" : "")}><Icon k="key" />{p.available}</span> : null}
            {p.inspection ? <span className="card__pill card__pill--insp"><Icon k="cal" />{p.inspection}</span> : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
