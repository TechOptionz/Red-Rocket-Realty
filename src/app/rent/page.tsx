import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RentClient from "./RentClient";

export const metadata: Metadata = { title: "Rent", description: "Houses and townhouses across Logan, managed by our largest team. Inspection times published, applications handled quickly." };

export default function RentPage() {
  return (
    <>
      <Header solid />
      <RentClient />
      <Footer />
    </>
  );
}
