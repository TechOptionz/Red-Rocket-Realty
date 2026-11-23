// Server-only listing access. Reads Supabase with the secret key (RLS blocks the public key), caches the result in Next's
// data cache under the "listings" tag, and maps rows into the site's Listing shape. The feed importer revalidates the tag.
// Without Supabase env vars the site runs on the static data in rr-data.ts.
import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { LAND, RENT, SALE, SOLD, type Listing, type ListingImage } from "@/data/rr-data";
import { streetLine } from "@/lib/feed/reaxml";

export const LISTINGS_TAG = "listings";
/** Seconds before cached listings are re-read even without a feed change (inspection and "New" flags are time-based). */
export const LISTINGS_REVALIDATE = 600;
const MAX_SOLD = 150;

export const supabaseConfigured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

type Row = {
  unique_id: string; short_id: string; slug: string; kind: string; status: string; mode: "buy" | "rent" | "sold";
  sub_number: string | null; street_number: string | null; street: string | null; suburb: string | null; state: string | null; postcode: string | null; address_display: boolean;
  category: string | null; headline: string | null; description: string | null;
  price: number | null; price_display: boolean; price_view: string | null; under_offer: boolean; auction_at: string | null; new_construction: boolean; home_land_package: boolean;
  rent: number | null; rent_period: string | null; rent_display: boolean; bond: number | null; date_available: string | null; deposit_taken: boolean;
  sold_price: number | null; sold_price_display: boolean; sold_date: string | null;
  beds: number | null; baths: number | null; ensuites: number | null; toilets: number | null; garages: number | null; carports: number | null; open_spaces: number | null;
  land_area: number | null; land_unit: string | null; building_area: number | null; building_unit: string | null;
  features: string[]; allowances: Listing["allowances"]; agents: NonNullable<Listing["agents"]>; inspections: NonNullable<Listing["inspections"]>;
  images: ListingImage[]; floorplans: ListingImage[]; video_url: string | null; tour_url: string | null; listed_at: string | null; mod_time: string;
};

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const area = (n: number | null, unit: string | null) => (n ? `${n.toLocaleString("en-AU")} ${unit || "m²"}` : "");
const SHADES = ["#2b2f37", "#343941", "#262a31", "#3a3f48", "#2f333b", "#41464f"];

/** The price line a buyer sees. Withheld figures never leave the server. */
function priceText(r: Row): string {
  if (r.mode === "sold") return r.sold_price_display && r.sold_price ? "Sold " + money(r.sold_price) : "Sold";
  if (r.mode === "rent") return r.rent_display && r.rent ? money(r.rent) + (/month/i.test(r.rent_period || "") ? " per month" : " per week") : r.price_view || "Contact agent";
  return r.price_view || (r.price_display && r.price ? money(r.price) : "Contact agent");
}

/** "Heading:" and short ALL-CAPS lines become sub-headings; "•" lines become list items (rendered by the property page). */
const paragraphs = (desc: string | null, headline: string | null) => {
  const blocks = (desc || "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length && headline && blocks[0].replace(/\s+/g, " ") === headline.replace(/\s+/g, " ")) blocks.shift(); // LockedOn repeats the headline
  return blocks;
};

function toListing(r: Row): Listing {
  const cars = (r.garages || 0) + (r.carports || 0) + (r.open_spaces || 0);
  const priceValue = r.mode === "sold" ? (r.sold_price_display ? r.sold_price : null) : r.mode === "rent" ? (r.rent_display ? r.rent : null) : r.price_display ? r.price : null;
  const agents = (r.agents || []).filter((a) => a.name && !/^rental admin$/i.test(a.name));
  return {
    id: r.slug, slug: r.slug, mode: r.mode, listingId: r.short_id,
    address: r.address_display ? streetLine(r) || r.suburb || "" : "Address available on request",
    suburb: r.suburb || "", postcode: r.postcode || undefined, state: r.state || "QLD",
    type: r.category || undefined, beds: r.beds || 0, baths: r.baths || 0, cars,
    land: area(r.land_area, r.land_unit), buildingArea: area(r.building_area, r.building_unit),
    price: priceText(r), priceValue: priceValue ?? null,
    rent: r.mode === "rent" && r.rent_display && r.rent ? r.rent : undefined, rentPeriod: r.rent_period, bond: r.bond,
    status: r.mode === "sold" ? "Sold" : r.under_offer ? "Under contract" : "",
    shade: SHADES[parseInt(r.short_id.slice(-2), 36) % SHADES.length],
    agent: agents[0]?.name, agent2: agents[1]?.name, agents: r.mode === "rent" ? [] : agents,
    headline: r.headline || undefined, desc: paragraphs(r.description, r.headline), features: r.features || [],
    photo: r.images[0]?.url, photos: r.images.map((i) => i.url),
    // Blur placeholders only matter for photos painted before any interaction (gallery grid, card carousels).
    images: r.images.map((i, k) => (k < 6 ? i : { url: i.url, w: i.w, h: i.h })),
    floorplans: r.floorplans.map((i) => i.url), floorplanImages: r.floorplans,
    map: r.address_display ? "pin" : "suburb",
    inspections: r.inspections || [], auctionAt: r.auction_at, underOffer: r.under_offer, depositTaken: r.deposit_taken,
    newConstruction: r.new_construction, homeLand: r.home_land_package, listedAt: r.listed_at, soldDate: r.sold_date, dateAvailable: r.date_available,
    videoUrl: r.video_url, tourUrl: r.tour_url, allowances: r.allowances || {},
    ensuites: r.ensuites, toilets: r.toilets, garages: r.garages, carports: r.carports,
  };
}

/** Newest first: for sale and rentals by listing date, sold by sale date. */
const sortKey = (l: Listing) => (l.mode === "sold" ? l.soldDate || "" : l.listedAt || "");

const readAll = unstable_cache(
  async (): Promise<Listing[]> => {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
    const { data, error } = await db.from("listings").select("*").eq("is_public", true).order("mod_time", { ascending: false }).limit(2000);
    if (error) throw new Error("listings: " + error.message);
    const all = (data as Row[]).map(toListing).sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
    // Keep the cache entry well under Next's 2 MB limit as sales accumulate: the most recent sales are what the site shows.
    let sold = 0;
    return all.filter((l) => l.mode !== "sold" || ++sold <= MAX_SOLD);
  },
  ["listings-v1"],
  { tags: [LISTINGS_TAG], revalidate: LISTINGS_REVALIDATE },
);

/** Every public listing with full detail. Server components only. */
export async function getListings(): Promise<Listing[]> {
  if (!supabaseConfigured()) return [...SALE, ...LAND, ...SOLD, ...RENT];
  return readAll();
}

/** A listing by URL id. Feed slugs end in the stable short id, so an old slug (address edited since) still resolves. */
export async function getListing(id: string): Promise<{ listing: Listing; canonical: boolean } | null> {
  const all = await getListings();
  const exact = all.find((l) => l.id === id);
  if (exact) return { listing: exact, canonical: true };
  const short = /-([a-z0-9]{8})$/.exec(id)?.[1];
  const moved = short ? all.find((l) => l.listingId === short) : undefined;
  return moved ? { listing: moved, canonical: false } : null;
}

/** What client components get on every page: no description/features/floor plans, and only the first few photos. */
export function toClientListing(l: Listing): Listing {
  const { desc: _d, features: _f, floorplans: _fp, floorplanImages: _fi, ...rest } = l;
  return { ...rest, photos: l.photos?.slice(0, 6), images: l.images?.slice(0, 6), photoCount: l.photos?.length ?? 0, hasFloorplan: !!l.floorplans?.length };
}
