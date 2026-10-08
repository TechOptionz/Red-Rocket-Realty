import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OpenHomesClient from "./OpenHomesClient";

export const metadata: Metadata = { title: "Open homes this week", description: "Every published inspection for sales and rentals, grouped by day." };

export default function OpenHomesPage() {
  return (
    <>
      <Header solid />
      <OpenHomesClient />
      <Footer />
    </>
  );
}
