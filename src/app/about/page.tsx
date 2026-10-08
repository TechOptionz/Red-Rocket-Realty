import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutClient from "./AboutClient";

export const metadata: Metadata = { title: "About", description: "Logan locals for over 25 years. Red Rocket Realty is committed to the property needs of Logan residents." };

export default function AboutPage() {
  return (
    <>
      <Header solid />
      <AboutClient />
      <Footer />
    </>
  );
}
