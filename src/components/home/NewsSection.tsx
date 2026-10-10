import Link from "next/link";
import { BLOG, PAGES, POSTS, postDate } from "@/data/rr-data";
import Lines from "@/components/Lines";
import Photo from "@/components/Photo";

/**
 * Latest news: the live site's "Latest News" block (newest post large, the next ones as a list with square thumbnails),
 * restyled for the design system. Each post opens its own page under /blog.
 */
export default function NewsSection() {
  const [lead, ...rest] = POSTS;
  const list = rest.slice(0, 4);
  return (
    <section id="news" className="section section--bg news">
      <div className="sec-head">
        <div className="sec-head__text" style={{ gap: 18 }}>
          <div className="kicker">{BLOG.label}</div>
          <Lines className="h2" lines={["Market news and", "property insights."]} />
        </div>
        <Link data-mag href={PAGES.blog} className="pill pill--dark pill--arrow" style={{ flex: "none" }}>
          <span>View more</span><span className="pill__arrow" aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="news__grid">
        <Link data-reveal href={lead.href} className="news-feat">
          <div data-reveal="clip" className="news-feat__media">
            <div className="news-feat__img">
              <div data-zoom style={{ position: "absolute", inset: 0 }}>
                <Photo src={lead.photo} alt="" sizes="(max-width: 980px) 100vw, 55vw" position={lead.position} />
              </div>
            </div>
            <span className="tag">Latest</span>
          </div>
          <div className="news-feat__body">
            <div className="news__meta"><time dateTime={lead.date}>{postDate(lead.date)}</time><i aria-hidden="true" /><span>{lead.topic}</span></div>
            <h3 className="news-feat__title">{lead.title}</h3>
            <p className="body news-feat__ex">{lead.excerpt}</p>
            <span className="text-link">Read article <span className="text-link__ring" data-arrow aria-hidden="true">→</span></span>
          </div>
        </Link>

        <div data-stagger className="news-list">
          {list.map((p) => (
            <Link key={p.slug} href={p.href} className="news-row">
              <div className="news-row__thumb">
                <div data-zoom style={{ position: "absolute", inset: 0 }}>
                  <Photo src={p.photo} alt="" sizes="(max-width: 720px) 88px, 120px" position={p.position} />
                </div>
              </div>
              <div className="news-row__text">
                <div className="news__meta"><time dateTime={p.date}>{postDate(p.date)}</time><i aria-hidden="true" /><span>{p.topic}</span></div>
                <div className="news-row__title">{p.title}</div>
                <p className="news-row__ex">{p.excerpt}</p>
              </div>
              <span data-arrow className="news-row__arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>

    </section>
  );
}
