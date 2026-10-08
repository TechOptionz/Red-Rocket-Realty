import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuidesClient from "./GuidesClient";

export const metadata: Metadata = { title: "Buyer and seller guides", description: "Step-by-step guides to buying and selling in Logan, written by the people who sell here every week." };

export default function GuidesPage() {
  return (
    <>
      <Header solid />
      <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
        <GuidesClient />
      </Suspense>
      <Footer />
    </>
  );
}
