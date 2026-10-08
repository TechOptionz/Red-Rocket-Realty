import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactClient from "./ContactClient";

export const metadata: Metadata = { title: "Contact", description: "Buying, selling or renting in Logan? Call 07 3340 4200 or send us a message." };

export default function ContactPage() {
  return (
    <>
      <Header solid />
      <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
        <ContactClient />
      </Suspense>
      <Footer />
    </>
  );
}
