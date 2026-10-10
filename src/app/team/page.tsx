import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TeamClient from "./TeamClient";

export const metadata: Metadata = { title: "Our team", description: "Nineteen locals. One team. Directors, sales agents, property managers, leasing and inspections at 67 Springwood Road." };

export default function TeamPage() {
  return (
    <>
      <Header solid />
      <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
        <TeamClient />
      </Suspense>
      <Footer />
    </>
  );
}
