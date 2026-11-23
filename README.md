# Red Rocket Realty · Next.js site

A Next.js 15 (App Router, React 19, TypeScript) build of the Claude Design prototype in
`Design scope and assets needed/`. Every page of the prototype is ported with its content,
layout, motion and interactions.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Routes

| Route | Prototype file |
| --- | --- |
| `/` | Red Rocket Home |
| `/listings?mode=buy|rent|land|sold&suburb=…&type=…&from=…&to=…&beds=…` | Red Rocket Listings |
| `/property/[id]` (ids `s1…`, `l1…`, `d1…`, `r1…`) | Red Rocket Property |
| `/sell`, `/appraisal`, `/rent`, `/property-management` | Sell, Appraisal, Rent, Property Management |
| `/about`, `/team#agent-slug`, `/contact?topic=…`, `/guides?guide=buyer|seller`, `/open-homes` | About, Team, Contact, Guides, Open Homes |
| `/blog`, `/blog/[slug]` | Latest news listing and the twelve article pages (mirrors the live site's blog; no prototype file) |

## Structure

- `src/app/globals.css` – design tokens (Red Hat Display, `#d5273a` red, charcoal inks), type scale,
  pill buttons, cards, forms, header/footer and the scroll-reveal system.
- `src/app/home.css`, `src/app/pages.css` – section-specific styles (imported globally from the layout).
- `src/components/` – `Header` (scroll-solid bar, mega menus, mobile menu, client logo picker),
  `Footer`, `RevealObserver` (reveal/stagger/magnetic/tilt/drift choreography), `PropertyCard`,
  `Pill`, `Lines`, `Crumb`, `Success`.
- `src/components/home/` – the home page sections (intro sequence, parallax hero + search,
  accordion listings strip, statement fill, counters, team strip, testimonials, latest news, appraisal wizard, contact).
- `src/data/rr-data.ts` – content: team, testimonials, guides, search options, photo map, logo registry, and the
  static sample listings used only when Supabase isn't configured.
- `src/lib/ics.ts` – calendar file generation for inspections.

## Listings feed (LockedOn → SFTP → Supabase)

LockedOn drops one REAXML file per listing change into `/upload` on the SFTP server. The importer picks them up,
writes `public.listings` in Supabase and refreshes the site.

```
LockedOn ──REAXML──▶ SFTP /upload ──(Supabase pg_cron, every minute)──▶ /api/feed/sync ──▶ Supabase ──revalidateTag("listings")──▶ pages
```

**Setup (once)**

1. Run `supabase/migrations/20261123000000_listings.sql` in the Supabase SQL editor.
2. Copy `.env.example` to `.env.local` and fill it in. Add the same variables in Vercel.
3. First import: `npm run feed:sync -- --backfill` (`--backfill` stops existing listings all showing as "New").
4. Deploy to Vercel (functions run in `syd1`, next to LockedOn's image bucket and the SFTP server).
5. Schedule the every-minute check in Supabase: fill in the two placeholders in `supabase/cron-feed-sync.sql`
   (site URL and `CRON_SECRET`) and run it in the SQL editor. It uses pg_cron + pg_net to call `/api/feed/sync`
   each minute, since Vercel Hobby only allows daily crons. `vercel.json` keeps a daily run as a backup; on Vercel
   Pro you can set that schedule to `* * * * *` and skip this step.

**Commands**

| Command | What it does |
| --- | --- |
| `npm run feed:sync` | Import new files once |
| `npm run feed:sync -- --watch` | Keep polling every 60 s (VPS / local alternative to Vercel Cron) |
| `npm run feed:sync -- --force` | Re-apply every file (after a parser change) |
| `npm run feed:sync -- --force --warm` | …and re-render every photo at the sizes the site requests |

**How it behaves**

- `feed_files` is a ledger of processed files, so each file is imported once. Files are applied oldest first, and an
  update whose REAXML `modTime` is older than the stored one is ignored. A database lock stops overlapping runs.
- `status="current"` shows under Buy (or Rent for `<rental>`); `sold` shows under Sold. `withdrawn`, `offmarket` and
  `leased` hide the listing, and its page 404s.
- Vendor details and the credentials attribute on `<propertyList>` are dropped while parsing and never stored. The
  tables have RLS on with no public policies; the site reads with the secret key on the server only, and withheld
  prices (`display="no"`) never reach the browser.
- URLs are `/property/<address>-<8-char id>`. The id is stable, so if the agent edits the address, old links 308 to the
  new slug.
- Flags (`src/lib/listings/flags.ts`): Under contract, Auction <day time>, Inspection <day time> / Open now, New
  (first seen within 7 days), New home, House & land, Deposit taken, Available <date>, Sold on <date>. They are computed
  in Queensland time from the render timestamp, so server HTML and the browser agree, then follow the real clock.

**Photos**

LockedOn image URLs (`resize.lockedoncloud.com/lovii-w:…`) accept any width and 301 to the rendered file on S3
(Sydney), which has no CDN or cache headers. `components/Photo.tsx` asks LockedOn for a near-size source (1080 or 2400 px
for JPEG; 640/1080/1600 for PNG, which LockedOn can't convert), and Next's optimizer turns it into an edge-cached WebP.
The importer pre-renders those sizes at LockedOn and stores a ~180-byte blur placeholder and aspect ratio per photo, so
cards paint instantly and no visitor waits on a cold resize. If the optimizer ever fails to fetch, the photo falls back
to LockedOn's own file instead of showing broken. LockedOn deletes rendered sizes after 180 days; the original stays,
and the next request re-renders it.

## Notes carried over from the prototype

- Forms (contact, enquiry, appraisal, maintenance, offer, alerts) are client-side only and show a
  success state; they need a backend or form service before launch.
- The header logo picker is a client-preview tool (choice stored in `localStorage`, key `rr-logo`).
  Remove it and hard-code the chosen mark in `LOGOS`/`DEFAULT_LOGO` before launch.
- Monospace "confirm / verify / sample data" notes are deliberate placeholders from the design pack.
- The blog (`/blog`, `/blog/[slug]` and the home page "Latest news" block) mirrors the live site's: `POSTS` in `rr-data.ts`
  holds the twelve posts and `rr-posts.ts` their article copy, read from the live WordPress posts. The newest is from Dec 2017.
  Point it at a CMS or feed and refresh the content before launch.
- Photos are hot-linked from redrocketrealty.com.au. The 48 Macmillan Loop set moved folders on the
  live site since the prototype was written and has been re-pointed; expect further drift until a feed exists.

# Red-Rocket-Realty
