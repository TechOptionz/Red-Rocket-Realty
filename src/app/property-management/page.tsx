import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PMClient from "./PMClient";

export const metadata: Metadata = { title: "Property management", description: "Your investment, looked after properly. Close tenant vetting, regular inspections and plain reporting." };

export default function PMPage() {
  return (
    <>
      <Header solid />
      <PMClient />
      <Footer />
    </>
  );
}
