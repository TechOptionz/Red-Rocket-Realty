import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { POSTS, postBySlug } from "@/data/rr-data";
import { POST_BODIES } from "@/data/rr-posts";
import PostArticle from "./PostArticle";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = postBySlug(slug);
  if (!p) return { title: "Latest news" };
  return { title: p.title, description: p.excerpt, openGraph: { title: p.title, description: p.excerpt, type: "article", publishedTime: p.date, images: [{ url: p.photo }] } };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = postBySlug(slug);
  if (!p) notFound();
  return (
    <>
      <Header solid />
      <PostArticle post={p} body={POST_BODIES[p.slug] || []} />
      <Footer />
    </>
  );
}
