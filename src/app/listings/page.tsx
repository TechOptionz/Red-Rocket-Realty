import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingsClient from "./ListingsClient";

export const metadata: Metadata = { title: "Properties for sale and rent", description: "Houses, units, townhouses and land across Logan City and surrounding areas." };

export default function ListingsPage() {
  return (
    <>
      <Header solid />
      <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
        <ListingsClient />
      </Suspense>
      <Footer />
    </>
  );
}
