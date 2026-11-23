"use client";
import Image, { type ImageLoader } from "next/image";
import { useState, type CSSProperties } from "react";
import { isLockedOn, lockedOnAt, sourceBucket } from "@/lib/feed/lockedon-image";

type Props = {
  src: string;
  /** Viewport-relative slot width, e.g. "(max-width: 720px) 100vw, 33vw". Drives which srcset candidate the browser picks. */
  sizes: string;
  alt?: string;
  /** Above-the-fold / LCP image: eager + high fetch priority + preload hint. Never set on below-the-fold images. */
  priority?: boolean;
  /** CSS object-position, mirrors the old background-position. */
  position?: string;
  quality?: number;
  /** Tiny data-URL preview (from the feed importer) painted until the photo arrives. */
  blur?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Feed photos: ask LockedOn's resizer for a JPEG near the target width (instead of the feed's 1–4 MB q100 original),
 * then hand that to Next's optimizer, which serves WebP from the edge cache. Local photos use the default loader.
 */
export const photoLoader: ImageLoader = ({ src, width, quality }) =>
  `/_next/image?url=${encodeURIComponent(lockedOnAt(src, sourceBucket(width, src), 85))}&w=${width}&q=${quality || 75}`;
export const loaderFor = (src: string) => (isLockedOn(src) ? photoLoader : undefined);

/**
 * Cover-fit photo that fills its positioned parent, replacing the old `background-image` divs.
 * Rendered through next/image so each slot gets a correctly sized WebP from the optimizer,
 * lazy-loads below the fold and never ships the 2000px original to a 300px card.
 */
export default function Photo({ src, sizes, alt = "", priority, position, quality = 80, blur, className, style }: Props) {
  // If the optimizer can't fetch a feed photo in time (a cold, very large PNG), load LockedOn's own rendition directly
  // rather than ever showing a broken image.
  const [direct, setDirect] = useState(false);
  const feed = isLockedOn(src);
  return (
    <Image
      key={direct ? "direct" : "optimized"}
      src={direct ? lockedOnAt(src, 1080, 85) : src}
      unoptimized={direct}
      onError={feed && !direct ? () => setDirect(true) : undefined}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      loader={direct ? undefined : loaderFor(src)}
      placeholder={blur ? "blur" : "empty"}
      blurDataURL={blur}
      draggable={false}
      className={className}
      style={{ objectFit: "cover", objectPosition: position || "center", ...style }}
    />
  );
}
