import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LAND, RENT, SALE, SOLD } from "@/data/rr-data";
import PropertyClient from "./PropertyClient";

const ALL = [...SALE, ...LAND, ...SOLD, ...RENT];

export function generateStaticParams() {
  return ALL.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = ALL.find((x) => x.id === id);
  if (!p) return { title: "Property" };
  return { title: `${p.address}, ${p.suburb}`, description: p.headline || `${p.type || "Property"} in ${p.suburb}` };
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = ALL.find((x) => x.id === id);
  if (!p) notFound();
  return (
    <>
      <Header solid />
      <PropertyClient p={p} />
      <Footer />
    </>
  );
}
