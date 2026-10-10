import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogClient from "./BlogClient";

export const metadata: Metadata = { title: "Latest news", description: "Market news, finance updates and property insights from Red Rocket Realty." };

export default function BlogPage() {
  return (
    <>
      <Header solid />
      <Suspense fallback={null}>
        <BlogClient />
      </Suspense>
      <Footer />
    </>
  );
}
