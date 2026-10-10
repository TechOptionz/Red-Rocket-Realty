import Link from "next/link";
import { postDate, type Post } from "@/data/rr-data";
import Photo from "@/components/Photo";

/** Blog post card: 16:10 photo with topic chip and arrow, then date, title and a clamped excerpt. Used on /blog and the "More news" strip. */
export default function PostCard({ post: p, delay = 0, sizes = "(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" }: { post: Post; delay?: number; sizes?: string }) {
  return (
    <Link data-card data-tilt="lift" data-reveal href={p.href} className="card blog-card" style={{ transitionDelay: delay + "s" }}>
      <div className="card__media" style={{ aspectRatio: "16/10" }}>
        <div data-zoom className="card__img"><Photo src={p.photo} alt="" sizes={sizes} position={p.position} /></div>
        <span className="card__chip">{p.topic}</span>
        <span className="card__arrow" data-arrow aria-hidden="true">→</span>
      </div>
      <div className="card__body" style={{ gap: 10, padding: "22px 22px 24px" }}>
        <div className="news__meta"><time dateTime={p.date}>{postDate(p.date)}</time></div>
        <div className="blog-card__title">{p.title}</div>
        <p className="blog-card__ex">{p.excerpt}</p>
      </div>
    </Link>
  );
}
