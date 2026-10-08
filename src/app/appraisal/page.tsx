import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppraisalClient from "./AppraisalClient";

export const metadata: Metadata = { title: "Free market appraisal", description: "Seven quick questions. A local agent calls you within one business day. No obligation, no cost." };

export default function AppraisalPage() {
  return (
    <>
      <Header solid />
      <AppraisalClient />
      <Footer />
    </>
  );
}
