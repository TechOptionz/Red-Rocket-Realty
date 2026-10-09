import type { Listing } from "@/data/rr-data";

// Location map for a listing. Mirrors the live site (Easy Property Listings + Google Maps): a street-address pin at zoom 17,
// or a suburb-level view when the vendor hides the street. Listings without `map` (or map: 'none') render nothing.
// Uses Google's keyless embed by default; set NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY to switch to the Maps Embed API.
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;

export function mapQuery(p: Listing) {
  const suburb = [p.suburb, "QLD", p.postcode].filter(Boolean).join(" ");
  return p.map === "suburb" ? suburb : `${p.address} ${suburb} Australia`;
}

export default function PropertyMap({ p }: { p: Listing }) {
  if (!p.map || p.map === "none") return null;
  const suburbOnly = p.map === "suburb";
  const q = encodeURIComponent(mapQuery(p));
  const zoom = suburbOnly ? 14 : 17;
  const src = KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${KEY}&q=${q}&zoom=${zoom}`
    : `https://www.google.com/maps?q=${q}&z=${zoom}&hl=en&output=embed`;
  const open = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  const label = suburbOnly ? p.suburb : `${p.address}, ${p.suburb}`;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="map prop-map">
        <iframe title={`Map · ${label}`} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        <div className="prop-map__actions">
          <a href={open} target="_blank" rel="noopener" className="pill pill--dark pill--sm">Open in Google Maps →</a>
          {!suburbOnly && <a href={directions} target="_blank" rel="noopener" className="pill pill--dark pill--sm">Get directions →</a>}
        </div>
      </div>
      {suburbOnly && <p className="small">Map shows the suburb only. Contact the agent for the exact location.</p>}
    </div>
  );
}
