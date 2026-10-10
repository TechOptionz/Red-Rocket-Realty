"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BLOG, CONTACT, PAGES, PHOTOS, POSTS, postDate } from "@/data/rr-data";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";
import Photo from "@/components/Photo";
import PostCard from "@/components/PostCard";

const TOPICS = ["All", ...Array.from(new Set(POSTS.map((p) => p.topic)))];

/** Blog listing: the live site's /blog/ (12 posts, newest first) as a filterable grid. ?topic=Finance preselects a filter. */
export default function BlogClient() {
  const params = useSearchParams();
  const [topic, setTopic] = useState("All");
  useEffect(() => {
    const t = params.get("topic");
    setTopic(t && TOPICS.includes(t) ? t : "All");
  }, [params]);
  const posts = POSTS.filter((p) => topic === "All" || p.topic === topic);
  const [lead, ...rest] = posts;

  return (
    <main>
      <section className="hero hero--page" style={{ minHeight: "64svh" }}>
        <div className="bsr__bg" aria-hidden="true"><Photo src={PHOTOS.parfreyTwilight} sizes="100vw" priority quality={75} /></div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__body">
          <Crumb tone="light" items={[["About", PAGES.about], [BLOG.label]]} />
          <div className="stack-m" style={{ flexWrap: "wrap", gap: 32, alignItems: "flex-end" }}>
            <div style={{ display: "grid", gap: 20, maxWidth: 900 }}>
              <Lines as="h1" className="display-xl" style={{ fontSize: "clamp(2.6rem,1.4rem + 5vw,6.4rem)", letterSpacing: "-.035em", lineHeight: .96 }} lines={["Market news and", <><span style={{ color: "var(--brand-red)" }}>property insights.</span></>]} />
              <p className="hero__sub">What is moving the market, what lenders are doing and what it means for buyers, sellers and investors in Logan.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-bar">
        <div className="oh-bar" style={{ paddingTop: 24 }}>
          <div className="strip" style={{ gap: 8, padding: 0 }}>
            {TOPICS.map((t) => (
              <button key={t} type="button" className="chip" data-on={t === topic ? "1" : "0"} onClick={() => setTopic(t)}>{t}</button>
            ))}
          </div>
          <span><b style={{ color: "var(--ink)", fontWeight: 800 }}>{posts.length}</b> {posts.length === 1 ? "article" : "articles"}</span>
        </div>
      </section>

      <section className="section--bg" style={{ padding: "40px var(--pad-x) var(--sec-y)" }}>
        {lead ? (
          <Link key={lead.slug} data-reveal href={lead.href} className="blog-lead">
            <div data-reveal="clip" className="blog-lead__media">
              <div data-zoom style={{ position: "absolute", inset: 0 }}><Photo src={lead.photo} alt="" sizes="(max-width: 980px) 100vw, 60vw" position={lead.position} /></div>
              <span className="tag">Latest</span>
            </div>
            <div className="blog-lead__body">
              <div className="news__meta"><time dateTime={lead.date}>{postDate(lead.date)}</time><i aria-hidden="true" /><span>{lead.topic}</span></div>
              <h2 className="h2--sm">{lead.title}</h2>
              <p className="lead">{lead.excerpt}</p>
              <span className="text-link">Read article <span className="text-link__ring" data-arrow aria-hidden="true">→</span></span>
            </div>
          </Link>
        ) : null}

        <div className="blog-grid" key={topic}>
          {rest.map((p, i) => <PostCard key={p.slug} post={p} delay={(i % 3) * 0.08} />)}
        </div>

        <div className="mono-note" style={{ paddingTop: 32 }}>Content mirrors the live WordPress blog · newest post Dec 2017 · wire a CMS or feed and refresh content before launch</div>
      </section>

      <section className="section section--dark">
        <div className="sec-head" style={{ marginBottom: 0 }}>
          <div className="sec-head__text" style={{ gap: 18 }}>
            <div className="kicker">Thinking of selling?</div>
            <Lines className="h2" lines={["Find out what your", "home is worth today."]} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: "none" }}>
            <Link data-mag href={PAGES.appraisal} className="pill pill--red pill--arrow"><span>Request an appraisal</span><span className="pill__arrow" aria-hidden="true">→</span></Link>
            <a href={CONTACT.phoneHref} className="pill pill--ghost-light">Call {CONTACT.phone}</a>
          </div>
        </div>
      </section>
    </main>
  );
}
