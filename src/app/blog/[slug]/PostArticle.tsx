import type { ReactNode } from "react";
import Link from "next/link";
import { BLOG, CONTACT, PAGES, POSTS, postDate, type Post } from "@/data/rr-data";
import { readMins, type Block } from "@/data/rr-posts";
import Crumb from "@/components/Crumb";
import Lines from "@/components/Lines";
import Photo from "@/components/Photo";
import PostCard from "@/components/PostCard";
import ShareBar from "@/components/ShareBar";

/** Break a title into two balanced lines for the rising-lines heading; short titles stay on one line. */
function titleLines(t: string): ReactNode[] {
  const w = t.split(" ");
  if (w.length < 4) return [t];
  const cut = Math.ceil(w.length / 2);
  return [w.slice(0, cut).join(" "), w.slice(cut).join(" ")];
}

/** Groups consecutive list items into one <ul>; headings become h2s so the article has a real outline. */
function renderBody(body: Block[]) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) out.push(<ul key={"ul" + out.length}>{list.map((li, i) => <li key={i}>{li}</li>)}</ul>);
    list = [];
  };
  body.forEach(([kind, text], i) => {
    if (kind === "li") { list.push(text); return; }
    flush();
    out.push(kind === "h" ? <h2 key={i}>{text}</h2> : <p key={i}>{text}</p>);
  });
  flush();
  return out;
}

export default function PostArticle({ post: p, body }: { post: Post; body: Block[] }) {
  const i = POSTS.findIndex((x) => x.slug === p.slug);
  const newer = i > 0 ? POSTS[i - 1] : null;
  const older = i < POSTS.length - 1 ? POSTS[i + 1] : null;
  // Related: same topic first, then the newest of the rest, never the current post.
  const related = [...POSTS.filter((x) => x.slug !== p.slug && x.topic === p.topic), ...POSTS.filter((x) => x.slug !== p.slug && x.topic !== p.topic)].slice(0, 3);
  const topics = Array.from(new Set(POSTS.map((x) => x.topic)));

  return (
    <main>
      <section className="hero hero--page post-hero">
        <div className="bsr__bg" aria-hidden="true"><Photo src={p.photo} sizes="100vw" priority quality={75} position={p.position} /></div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__body">
          <Crumb tone="light" items={[[BLOG.label, PAGES.blog], [p.topic]]} />
          <div style={{ display: "grid", gap: 20, maxWidth: 1000 }}>
            <div className="kicker kicker--photo"><time dateTime={p.date}>{postDate(p.date)}</time><span className="post-hero__dot" aria-hidden="true" />{p.topic}<span className="post-hero__dot" aria-hidden="true" />{readMins(body)} min read</div>
            <Lines as="h1" className="display-lg" style={{ fontSize: "clamp(2.2rem,1.2rem + 4vw,5.2rem)", letterSpacing: "-.035em", lineHeight: .98 }} lines={titleLines(p.title)} />
          </div>
        </div>
      </section>

      <section className="section--bg post">
        <div className="post__cols">
          <article className="post__body" data-reveal>
            <p className="post__lead">{p.excerpt}</p>
            {renderBody(body)}
            <div className="post__foot">
              <div>Published {postDate(p.date)} · Red Rocket Realty</div>
              <ShareBar title={p.title} />
            </div>
          </article>

          <aside className="post__side">
            <div className="sticky" style={{ display: "grid", gap: 16 }}>
              <div data-reveal className="post__card post__card--dark" style={{ transitionDelay: ".1s" }}>
                <div className="kicker kicker--white">Talk to a local agent</div>
                <div className="h3" style={{ fontSize: "clamp(1.3rem,1.1rem + .8vw,1.7rem)" }}>Wondering what this means for your home?</div>
                <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--grey-light)" }}>Our Springwood team can talk you through local values, timing and what buyers are looking for right now.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Link href={PAGES.appraisal} className="pill pill--red pill--sm pill--arrow"><span>Free appraisal</span><span className="pill__arrow" aria-hidden="true">→</span></Link>
                  <a href={CONTACT.phoneHref} className="pill pill--ghost-light pill--sm">Call {CONTACT.phone}</a>
                </div>
              </div>
              <div data-reveal className="post__card" style={{ transitionDelay: ".2s" }}>
                <div className="kicker">Share</div>
                <ShareBar title={p.title} />
              </div>
              <div data-reveal className="post__card" style={{ transitionDelay: ".3s" }}>
                <div className="kicker">Topics</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {topics.map((t) => <Link key={t} href={PAGES.blog + "?topic=" + encodeURIComponent(t)} className="chip" data-on={t === p.topic ? "1" : "0"} style={{ height: 38, padding: "0 14px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>{t}</Link>)}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <nav className="post__nav" aria-label="More articles">
          {older ? (
            <Link href={older.href} data-dir="prev"><span className="post__nav-k">← Older</span><span className="post__nav-t">{older.title}</span></Link>
          ) : <span />}
          {newer ? (
            <Link href={newer.href} data-dir="next"><span className="post__nav-k">Newer →</span><span className="post__nav-t">{newer.title}</span></Link>
          ) : <span />}
        </nav>
      </section>

      <section className="section section--white">
        <div className="sec-head">
          <div className="sec-head__text" style={{ gap: 18 }}>
            <div className="kicker">More news</div>
            <Lines className="h2" lines={["Keep reading."]} />
          </div>
          <Link data-mag href={PAGES.blog} className="pill pill--dark" style={{ flex: "none" }}>All articles</Link>
        </div>
        <div className="blog-grid">
          {related.map((r, k) => <PostCard key={r.slug} post={r} delay={k * 0.08} />)}
        </div>
      </section>
    </main>
  );
}
