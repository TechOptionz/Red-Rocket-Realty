import Link from "next/link";
import { decorate, formatRent, propHref, specs, type Listing } from "@/data/rr-data";

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

/** Standard listing card (image, status tag, arrow, price/address/specs). */
export default function PropertyCard({ p, ratio = "3/2", light, width, showMeta, specsCount, priceOverride, style, addrFormat = "full" }: Props) {
  const d = decorate(p);
  const isRent = !!p.rent;
  const priceText = priceOverride ?? (isRent ? formatRent(p.rent!) : p.price);
  const sp = specs(p);
  const meta = [p.available, p.inspection ? "Inspection · " + p.inspection : ""].filter(Boolean).join(" · ");
  return (
    <Link data-card href={propHref(p)} className={"card" + (light ? " card--light" : "")} style={{ width, ...style }}>
      <div className="card__media" style={{ aspectRatio: ratio }}>
        <div data-zoom className="card__img" style={{ backgroundColor: p.shade, backgroundImage: d.bgImage }}>
          {d.imgTag ? (<><span>{d.imgTag}</span><br /><span>{d.img}</span></>) : null}
        </div>
        {p.status ? <span className={"tag" + (p.status === "Sold" ? " tag--sold" : "")}>{p.status}</span> : null}
        <span data-arrow className="card__arrow" aria-hidden="true">→</span>
      </div>
      <div style={{ display: "grid", gap: 4 }}>
        <div className="card__price">{priceText}</div>
        <div className="card__addr">{addrFormat === "full" ? p.address + ", " + p.suburb : p.suburb + " · " + p.type}</div>
        <div className="card__specs">{(specsCount ? sp.slice(0, specsCount) : sp).join(" · ")}</div>
        {showMeta && meta ? <div className="card__meta">{meta}</div> : null}
      </div>
    </Link>
  );
}
