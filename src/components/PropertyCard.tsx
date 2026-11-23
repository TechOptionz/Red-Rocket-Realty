"use client";
import Link from "next/link";
import { decorate, formatRent, isRental, propHref, type Listing } from "@/data/rr-data";
import Photo from "@/components/Photo";
import ListingFlags from "@/components/ListingFlags";
import { useNow } from "@/components/ListingsProvider";
import { availableLabel } from "@/lib/listings/flags";

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
  cam: <path d="M4 8h3l2-3h6l2 3h3v11H4V8ZM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />,
  plan: <path d="M4 4h16v16H4zM4 12h7M11 4v12M15 12h5" />,
  play: <path d="m8 5 11 7-11 7V5Z" />,
};
const Icon = ({ k }: { k: keyof typeof ICON }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON[k]}</svg>
);

/** Standard listing card: contained surface, portal-style flags over the photo, icon specs, price and address hierarchy. */
export default function PropertyCard({ p, ratio = "3/2", light, width, showMeta, specsCount, priceOverride, style, addrFormat = "full" }: Props) {
  const now = useNow();
  const d = decorate(p);
  const isRent = isRental(p);
  const isLand = p.type === "Land";
  // Feed listings carry a ready price line (withheld prices already resolved server-side); static data stores weekly rent as a number.
  const priceText = priceOverride ?? (p.mode ? p.price : isRent && p.rent ? formatRent(p.rent) : p.price);
  const specItems: { k: keyof typeof ICON; n: string | number; label: string }[] = isLand
    ? [{ k: "land", n: p.land || "", label: "land" }]
    : [{ k: "bed", n: p.beds, label: "bed" }, { k: "bath", n: p.baths, label: "bath" }, { k: "car", n: p.cars, label: "car" }, ...(p.land && p.mode ? [{ k: "land" as const, n: p.land, label: "land" }] : [])];
  const shown = specsCount ? specItems.slice(0, specsCount) : specItems;
  const addrMain = addrFormat === "full" ? p.address : p.suburb;
  const addrSub = addrFormat === "full" ? p.suburb + (p.postcode ? " " + (p.state || "QLD") + " " + p.postcode : "") : (p.type || "");
  const available = isRent ? availableLabel(p, now) : null;
  const availNow = /now/i.test(available || "");
  const photoCount = p.photoCount ?? p.photos?.length ?? 0;
  return (
    <Link data-card href={propHref(p)} className={"card" + (light ? " card--light" : "")} style={{ width, ...style }}>
      <div className="card__media" style={{ aspectRatio: ratio }}>
        <div data-zoom className="card__img" style={{ backgroundColor: p.shade, backgroundImage: p.photo ? undefined : d.bgImage }}>
          {p.photo ? <Photo src={p.photo} blur={p.images?.[0]?.blur} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 420px" /> : null}
          {d.imgTag ? (<><span>{d.imgTag}</span><br /><span>{d.img}</span></>) : null}
        </div>
        <div className="card__shade" aria-hidden="true" />
        <ListingFlags p={p} max={2} />
        {p.type ? <span className="card__chip card__chip--r">{p.type}</span> : null}
        {p.mode && photoCount > 1 ? (
          <div className="card__media-meta" aria-hidden="true">
            <span><Icon k="cam" />{photoCount}</span>
            {p.hasFloorplan ? <span><Icon k="plan" /></span> : null}
            {p.videoUrl ? <span><Icon k="play" /></span> : null}
          </div>
        ) : null}
        <span data-arrow className="card__arrow card__arrow--fill" aria-hidden="true">→</span>
      </div>
      <div className="card__body">
        <div className="card__top">
          <div className="card__price">{priceText}</div>
          {isRent && !p.mode ? <span className="card__per">Weekly rent</span> : null}
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
        {showMeta && (available || (!p.mode && p.inspection)) ? (
          <div className="card__foot">
            {available ? <span className={"card__pill" + (availNow ? " card__pill--now" : "")}><Icon k="key" />{available}</span> : null}
            {!p.mode && p.inspection ? <span className="card__pill card__pill--insp"><Icon k="cal" />{p.inspection}</span> : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
