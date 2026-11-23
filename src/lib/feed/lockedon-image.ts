// LockedOn image URLs: https://resize.lockedoncloud.com/lovii-w:1228-h:829-q:100/f7/92/…/ce.jpg
// The segment after "lovii-" is a resize instruction, so any width can be requested from the same source photo.
// The service answers with a 301 to the generated file on S3 (ap-southeast-2). Safe to import from client code.

export const LOCKEDON_HOST = "resize.lockedoncloud.com";
const RE = /^https?:\/\/resize\.lockedoncloud\.com\/lovii-([^/]+)\/(.+)$/i;

export function parseLockedOnUrl(url: string): { params: Record<string, string>; path: string } | null {
  const m = RE.exec(url);
  if (!m) return null;
  const params: Record<string, string> = {};
  for (const part of m[1].split("-")) {
    const i = part.indexOf(":");
    if (i > 0) params[part.slice(0, i)] = part.slice(i + 1);
  }
  return { params, path: m[2] };
}

export const isLockedOn = (url: string) => RE.test(url);

/** Same photo at a given width and JPEG quality, or the URL unchanged when it is not a LockedOn image. */
export function lockedOnAt(url: string, width: number, quality = 85): string {
  const p = parseLockedOnUrl(url);
  if (!p) return url;
  return `https://${LOCKEDON_HOST}/lovii-w:${Math.round(width)}-q:${quality}/${p.path}`;
}

/**
 * Source widths requested from LockedOn before Next's optimizer re-encodes to WebP. Bucketing keeps the number of distinct
 * source files small (each is generated once on LockedOn's side, then cached), and fetching a near-size JPEG instead of the
 * feed's 1–4 MB q100 original makes a cold optimizer miss several times faster.
 */
// Every photo is pre-rendered at its sizes during import (see sync.ts), so no visitor waits on a cold LockedOn resize.
// LockedOn keeps the upload's format: PNG photos stay PNG (~1.5 MB at 1080px), so they get finer, smaller steps.
const JPEG_BUCKETS = [1080, 2400];
const PNG_BUCKETS = [640, 1080, 1600];
const isPng = (url: string) => /\.png$/i.test(url);
export const sourceWidths = (url: string) => (isPng(url) ? PNG_BUCKETS : JPEG_BUCKETS);
export const sourceBucket = (w: number, url = "") => { const b = sourceWidths(url); return b.find((x) => x >= w) ?? b[b.length - 1]; };
