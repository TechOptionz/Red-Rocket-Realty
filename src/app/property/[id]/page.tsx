import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { propHref } from "@/data/rr-data";
import { getListing, getListings } from "@/lib/listings/server";
import { lockedOnAt } from "@/lib/feed/lockedon-image";
import PropertyClient from "./PropertyClient";

// Pre-render every current listing at build; new feed listings render on first visit, then serve from cache
// until the importer revalidates the "listings" tag.
export const dynamicParams = true;
export const revalidate = 600;

export async function generateStaticParams() {
  return (await getListings()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = await getListing(id);
  if (!r) return { title: "Property" };
  const p = r.listing;
  const where = `${p.address}, ${p.suburb} ${p.state || "QLD"}${p.postcode ? " " + p.postcode : ""}`;
  const what = [p.beds ? p.beds + " bed" : "", p.baths ? p.baths + " bath" : "", p.cars ? p.cars + " car" : "", p.type].filter(Boolean).join(" · ");
  const description = [p.price, what, p.headline].filter(Boolean).join(" · ");
  return {
    title: where,
    description,
    alternates: { canonical: propHref(p) },
    openGraph: { title: where, description, type: "website", images: p.photo ? [{ url: lockedOnAt(p.photo, 1200, 80), width: 1200 }] : undefined },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getListing(id);
  if (!r) notFound();
  // The slug carries the address; if the agent edited it since, send old links to the current URL.
  if (!r.canonical) permanentRedirect(propHref(r.listing));
  return (
    <>
      <Header />
      <PropertyClient p={r.listing} />
      <Footer />
    </>
  );
}
