// REAXML (realestate.com.au listing XML, as exported by LockedOn) → rows for public.listings.
// Pure: no network, no database. Vendor details and the propertyList credentials attribute are dropped here and never stored.
import { createHash } from "node:crypto";
import { XMLParser } from "fast-xml-parser";

/** Listing elements a REAXML <propertyList> may contain. */
const KINDS = ["residential", "rental", "land", "rural", "commercial", "commercialLand", "business", "holidayRental"] as const;
export type FeedKind = (typeof KINDS)[number];

export type FeedImage = { url: string; w?: number; h?: number; blur?: string };
export type FeedAgent = { name: string; phone?: string; email?: string };
export type FeedInspection = { start: string; end: string };

/** A listing as it is written to public.listings (snake_case columns). */
export type FeedListing = {
  unique_id: string; agent_id: string | null; short_id: string; slug: string; kind: FeedKind; status: string;
  sub_number: string | null; street_number: string | null; street: string | null; suburb: string | null; state: string | null; postcode: string | null; address_display: boolean;
  category: string | null; headline: string | null; description: string | null;
  price: number | null; price_display: boolean; price_view: string | null; under_offer: boolean; auction_at: string | null; new_construction: boolean; home_land_package: boolean;
  rent: number | null; rent_period: string | null; rent_display: boolean; bond: number | null; date_available: string | null; deposit_taken: boolean;
  sold_price: number | null; sold_price_display: boolean; sold_date: string | null;
  beds: number | null; baths: number | null; ensuites: number | null; toilets: number | null; garages: number | null; carports: number | null; open_spaces: number | null;
  land_area: number | null; land_unit: string | null; building_area: number | null; building_unit: string | null;
  features: string[]; allowances: Record<string, boolean>; agents: FeedAgent[]; inspections: FeedInspection[]; images: FeedImage[]; floorplans: FeedImage[];
  video_url: string | null; tour_url: string | null; mod_time: string;
};

/** Parsed result for one listing element. `partial` = a status-only update (withdrawn, off market, leased): only status and mod_time apply. */
export type ParsedListing = { row: FeedListing; partial: boolean };

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  processEntities: true,
  isArray: (name) => ["listingAgent", "telephone", "img", "floorplan", "inspection", "externalLink", "videoLink", ...KINDS].includes(name),
});

// ── value helpers ────────────────────────────────────────────────────────────
type Node = unknown;
const obj = (v: Node): Record<string, Node> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, Node>) : {});
const text = (v: Node): string => {
  if (v === null || v === undefined) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v).trim();
  if (Array.isArray(v)) return text(v[0]);
  return text(obj(v)["#text"]);
};
const str = (v: Node) => text(v) || null;
const attr = (v: Node, name: string) => text(obj(v)["@_" + name]);
const num = (v: Node): number | null => {
  const t = text(v).replace(/[$,\s]/g, "");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};
const int = (v: Node) => { const n = num(v); return n === null ? null : Math.round(n); };
/** REAXML booleans arrive as <x/>, <x>yes</x>, <x>1</x>, <x value="no"/>, <x>false</x>. Empty means "not set" (false). */
const bool = (v: Node): boolean => {
  const raw = (attr(v, "value") || text(v)).toLowerCase();
  if (!raw) return false;
  if (["yes", "true", "y"].includes(raw)) return true;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0;
};
/** display="no" hides a value; anything else (yes, range, missing) shows it. */
const shown = (v: Node) => attr(v, "display").toLowerCase() !== "no";
const arr = (v: Node): Node[] => (Array.isArray(v) ? v : v === undefined || v === null || v === "" ? [] : [v]);

// ── time: LockedOn writes agency-local time (Queensland, UTC+10, no daylight saving) ─────────────
const TZ = "+10:00";
const MONTHS: Record<string, string> = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
const pad = (n: number | string) => String(n).padStart(2, "0");
/** "2026-11-22-14:26:15" | "2026-11-22 14:26" | "2026-11-22T14:26:15" → ISO with the agency offset. */
export function feedTime(s: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[-T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(s.trim());
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}T${pad(m[4] ?? 0)}:${m[5] ?? "00"}:${m[6] ?? "00"}${TZ}`;
}
const date = (s: string): string | null => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s.trim()); return m ? `${m[1]}-${m[2]}-${m[3]}` : null; };
const to24 = (h: string, ampm: string) => { let n = Number(h) % 12; if (ampm.toLowerCase() === "pm") n += 12; return pad(n); };
/** "26-Nov-2026 05:00pm to 05:30pm" → { start, end }. */
export function feedInspection(s: string): FeedInspection | null {
  const m = /(\d{1,2})-([A-Za-z]{3})-(\d{4})\s+(\d{1,2}):(\d{2})\s*([ap]m)\s*(?:to|-)\s*(\d{1,2}):(\d{2})\s*([ap]m)/i.exec(s);
  if (!m) return null;
  const mon = MONTHS[m[2].toLowerCase()];
  if (!mon) return null;
  const day = `${m[3]}-${mon}-${pad(m[1])}`;
  return { start: `${day}T${to24(m[4], m[6])}:${m[5]}:00${TZ}`, end: `${day}T${to24(m[7], m[9])}:${m[8]}:00${TZ}` };
}

// ── features ─────────────────────────────────────────────────────────────────
const FEATURE_LABELS: Record<string, string> = {
  airConditioning: "Air conditioning", reverseCycleAirCon: "Reverse-cycle air conditioning", splitSystemAirCon: "Split-system air conditioning",
  ductedCooling: "Ducted cooling", evaporativeCooling: "Evaporative cooling", heating: "Heating", ductedHeating: "Ducted heating",
  gasHeating: "Gas heating", hydronicHeating: "Hydronic heating", splitSystemHeating: "Split-system heating", openFirePlace: "Open fireplace",
  ensuite: "Ensuite", builtInRobes: "Built-in wardrobes", dishwasher: "Dishwasher", study: "Study", rumpusRoom: "Rumpus room",
  floorboards: "Floorboards", gym: "Gym", insideSpa: "Indoor spa", outsideSpa: "Outdoor spa", payTV: "Pay TV access", broadband: "Broadband internet",
  alarmSystem: "Alarm system", intercom: "Intercom", vacuumSystem: "Ducted vacuum",
  balcony: "Balcony", deck: "Deck", courtyard: "Courtyard", outdoorEnt: "Outdoor entertaining area", fullyFenced: "Fully fenced",
  shed: "Shed", workshop: "Workshop", tennisCourt: "Tennis court", poolInGround: "In-ground pool", poolAboveGround: "Above-ground pool", pool: "Swimming pool",
  remoteGarage: "Remote garage", secureParking: "Secure parking",
  solarPanels: "Solar panels", solarHotWater: "Solar hot water", waterTank: "Water tank", greyWaterSystem: "Grey water system",
};
const VIEW_LABELS: Record<string, string> = { city: "City views", water: "Water views", valley: "Valley views", mountain: "Mountain views", ocean: "Ocean views" };
const CATEGORY_LABELS: Record<string, string> = {
  "DuplexSemi-detached": "Duplex/Semi-detached", "AcreageSemi-rural": "Acreage", BlockOfUnits: "Block of units",
  ServicedApartment: "Serviced apartment", Retirement: "Retirement living",
};
const UNIT_LABELS: Record<string, string> = { squareMeter: "m²", squareMetre: "m²", acre: "acres", hectare: "ha", square: "squares" };

function features(f: Record<string, Node>, eco: Record<string, Node>, views: Record<string, Node>): string[] {
  const out: string[] = [];
  for (const [k, label] of Object.entries(FEATURE_LABELS)) {
    const v = f[k] ?? eco[k];
    if (v !== undefined && bool(v)) out.push(label);
  }
  for (const [k, label] of Object.entries(VIEW_LABELS)) if (views[k] !== undefined && bool(views[k])) out.push(label);
  // otherFeatures is free text: "Ceiling fans, Solar, NBN"
  for (const s of text(f.otherFeatures).split(/[,;\n]/)) { const t = s.trim(); if (t && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t); }
  return out;
}

// ── images: <img id="m"> is the main photo, then a…z, aa…; empty <img id="x"/> marks a removed slot ──
const imgOrder = (id: string) => (id === "m" ? -1 : id.length * 1000 + id.charCodeAt(0) * 10 + (id.charCodeAt(1) || 0));
function images(objects: Record<string, Node>, tag: "img" | "floorplan"): FeedImage[] {
  return arr(objects[tag])
    .map((n) => ({ id: attr(n, "id"), url: attr(n, "url") || text(n) }))
    .filter((i) => /^https?:\/\//i.test(i.url))
    .sort((a, b) => (tag === "img" ? imgOrder(a.id) - imgOrder(b.id) : Number(a.id) - Number(b.id)))
    .map((i) => ({ url: i.url }));
}

function agents(el: Record<string, Node>): FeedAgent[] {
  return arr(el.listingAgent)
    .map((a) => {
      const o = obj(a);
      const phones = arr(o.telephone).map((t) => ({ type: attr(t, "type"), v: text(t) })).filter((t) => t.v);
      const phone = (phones.find((t) => t.type === "mobile") || phones[0])?.v;
      return { name: text(o.name), phone: phone || undefined, email: text(o.email) || undefined };
    })
    .filter((a) => a.name);
}

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
/** Stable 8-character id for a listing, used as the URL suffix so links survive address edits. */
export const shortId = (agentId: string | null, uniqueId: string) =>
  BigInt("0x" + createHash("sha1").update((agentId || "") + ":" + uniqueId).digest("hex").slice(0, 12)).toString(36).padStart(8, "0").slice(-8);

export function streetLine(r: Pick<FeedListing, "sub_number" | "street_number" | "street">): string {
  const num = [r.sub_number, r.street_number].filter(Boolean).join("/");
  return [num, r.street].filter(Boolean).join(" ");
}

function parseListing(kind: FeedKind, el: Record<string, Node>): ParsedListing | null {
  const unique_id = text(el.uniqueID);
  if (!unique_id) return null;
  const agent_id = str(el.agentID);
  const status = (attr(el, "status") || "current").toLowerCase();
  const mod_time = feedTime(attr(el, "modTime")) || new Date().toISOString();

  const a = obj(el.address);
  const address_display = shown(el.address);
  const category = kind === "land" ? "Land"
    : (() => { const c = attr(el.category, "name") || attr(el.commercialCategory, "name") || attr(el.ruralCategory, "name") || attr(el.businessCategory, "name"); return c ? CATEGORY_LABELS[c] || c : null; })();
  const f = obj(el.features);
  const land = obj(el.landDetails), building = obj(el.buildingDetails);
  const objects = { ...obj(el.images), ...obj(el.objects) };
  const sold = obj(el.soldDetails);
  const rentNode = arr(el.rent)[0];
  const allowances = obj(el.allowances);
  const auction = el.auction !== undefined ? feedTime(attr(el.auction, "date") || text(el.auction)) : null;
  const link = (n: Node) => arr(n).map((x) => attr(x, "href") || text(x)).find((h) => /^https?:\/\//i.test(h)) || null;

  const row: FeedListing = {
    unique_id, agent_id, short_id: shortId(agent_id, unique_id), slug: "", kind, status,
    sub_number: str(a.subNumber) || (str(a.lotNumber) ? "Lot " + text(a.lotNumber) : null), street_number: str(a.streetNumber), street: str(a.street),
    suburb: str(a.suburb), state: str(a.state)?.toUpperCase() ?? null, postcode: str(a.postcode), address_display,
    category, headline: str(el.headline), description: text(el.description).replace(/\r\n?/g, "\n") || null,
    price: num(el.price), price_display: shown(el.price), price_view: str(el.priceView), under_offer: bool(el.underOffer),
    auction_at: auction, new_construction: bool(el.newConstruction), home_land_package: bool(el.isHomeLandPackage),
    rent: num(rentNode), rent_period: rentNode !== undefined ? attr(rentNode, "period") || "week" : null, rent_display: rentNode === undefined || shown(rentNode),
    bond: num(el.bond), date_available: date(text(el.dateAvailable)), deposit_taken: bool(el.depositTaken),
    sold_price: num(sold.soldPrice), sold_price_display: sold.soldPrice !== undefined && shown(sold.soldPrice), sold_date: date(text(sold.soldDate) || text(sold.date)),
    beds: int(f.bedrooms), baths: int(f.bathrooms), ensuites: int(f.ensuite), toilets: int(f.toilets),
    garages: int(f.garages), carports: int(f.carports), open_spaces: int(f.openSpaces),
    land_area: num(land.area), land_unit: land.area !== undefined ? UNIT_LABELS[attr(land.area, "unit")] || attr(land.area, "unit") || "m²" : null,
    building_area: num(building.area), building_unit: building.area !== undefined ? UNIT_LABELS[attr(building.area, "unit")] || attr(building.area, "unit") || "m²" : null,
    features: features(f, obj(el.ecoFriendly), obj(el.views)),
    allowances: Object.fromEntries((["petFriendly", "furnished", "smokers"] as const).filter((k) => allowances[k] !== undefined).map((k) => [k === "petFriendly" ? "pets" : k, bool(allowances[k])])),
    agents: agents(el),
    inspections: arr(obj(el.inspectionTimes).inspection).map((i) => feedInspection(text(i))).filter((i): i is FeedInspection => !!i).sort((x, y) => x.start.localeCompare(y.start)),
    images: images(objects, "img"), floorplans: images(objects, "floorplan"),
    video_url: link(el.videoLink), tour_url: link(el.externalLink), mod_time,
  };
  const place = [row.suburb, row.state, row.postcode].filter(Boolean).join(" ");
  row.slug = slugify((address_display ? streetLine(row) + " " : (category || "property") + " ") + place) + "-" + row.short_id;
  return { row, partial: !["current", "sold"].includes(status) };
}

/** Parse one REAXML document. Throws on malformed XML; returns [] when it holds no listings. */
export function parseReaxml(xml: string): ParsedListing[] {
  const doc = parser.parse(xml);
  const list = obj(doc.propertyList);
  const out: ParsedListing[] = [];
  for (const kind of KINDS) for (const el of arr(list[kind])) { const p = parseListing(kind, obj(el)); if (p) out.push(p); }
  return out;
}
