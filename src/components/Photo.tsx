import Image from "next/image";
import type { CSSProperties } from "react";

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
  className?: string;
  style?: CSSProperties;
};

/**
 * Cover-fit photo that fills its positioned parent, replacing the old `background-image` divs.
 * Rendered through next/image so each slot gets a correctly sized AVIF/WebP from the optimizer,
 * lazy-loads below the fold and never ships the 2000px original to a 300px card.
 */
export default function Photo({ src, sizes, alt = "", priority, position, quality = 80, className, style }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      draggable={false}
      className={className}
      style={{ objectFit: "cover", objectPosition: position || "center", ...style }}
    />
  );
}
