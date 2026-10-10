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
- `src/data/rr-data.ts` – all content: listings, team, testimonials, guides, search options, photo map,
  logo registry. Ported from `rr-data.js`; swap for a listing-feed API when one is wired up.
- `src/lib/ics.ts` – calendar file generation for inspections.

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
