# SERHANT-Inspired Real Estate Design Blueprint

Oct 7, 2026 · @Jawad

## 0. Scope, method and the one thing to know first

The reference homepage feels cinematic because of video, heavy type, pill geometry and hover-driven components. Its scroll choreography is light: no pinned sections, parallax, clip-path reveals, split-text headings, horizontal-scroll sections or smooth-scroll library were found on it.

This blueprint therefore uses two tiers. **Faithful** is what the reference does, measured. **Elevated** is an optional addition in the same character, and is labelled every time it appears. Build Faithful first; add Elevated items only where the new brand wants more motion.

**Inspected on 7 Oct 2026:** homepage at a 1527×881 desktop viewport and at 1280, 1100, 820 and 390 px widths; main menu; search overlay; mobile menu; one property detail page; the new-development landing page.

**Not verified:** touch gestures on real devices, widths above 1980 px (read from CSS only), load-performance metrics, and the exact duration of the menu slide (CSS reports no transition; it appears near-instant).

### What the reference is built with

| Layer | Observed on the reference |
| --- | --- |
| Platform | A hosted real-estate site platform (component classes prefixed `lp-`; platform credit in the footer). Not a bespoke build. |
| DOM / behaviour | jQuery 3.7.1 |
| Carousels | slick 1.8.1 for every homepage carousel; Splide also loaded |
| Entrance animation | WOW.js 1.1.2 with animate.css-style keyframes (`fadeIn`, `fadeInUp`, `fadeInLeft/Right/Down`, `slideInUp`, `zoomIn`, `bounceIn`) |
| GSAP | 3.11.5 core only. No ScrollTrigger, no SplitText |
| Smooth scroll | CSS `scroll-behavior: smooth` only. No Lenis or Locomotive |
| Parallax | A parallax plugin is loaded, but no homepage element uses it |
| Canvas | One rotating dot-matrix globe drawn on `<canvas>` |
| Font | Montserrat (Google Fonts), weights 400, 500, 700, 800 |

### Effects you asked about, and whether the reference has them

| Effect | On the reference homepage | In this blueprint |
| --- | --- | --- |
| Fade + translate on entry | Yes, on the stats block only (`fadeInUp`, staggered) | Faithful, extended to all section headers |
| Staggered / line-by-line / word-by-word heading reveals | No | Elevated |
| Mask or clip-path reveals | No (photos are pre-cut into a letterform shape, not animated) | Elevated |
| Image scale while scrolling | No | Elevated |
| Parallax | No | Elevated, hero and video bands only |
| Pinned / sticky sections | No on homepage. Yes on property page: sticky enquiry card | Faithful on property page |
| Horizontal-scroll sections | No. Carousels are drag/arrow driven | Not recommended |
| Background-colour transitions on scroll | No (hard cuts between white, off-white, black, navy) | Elevated, one place only |
| Overlapping sections | Yes: rounded off-white sheet rises over the dark hero | Faithful |
| Cards entering sequentially | No | Elevated |
| Animated numbers | Yes: count-up on four stats | Faithful |
| Section snapping | No | Not recommended |
| Hover-expand accordion carousel | Yes: the signature interaction | Faithful |
| Hover image reveal behind a link grid | Yes: regions block | Faithful |
| Hover-expand glass cards over video | Yes: services block | Faithful |
| Continuous logo marquee | Yes | Faithful |
| Custom cursor | No | Not recommended |

### Content rule

Nothing in this document reuses the reference's copy, listings, photography, video, logo or monogram. Every content slot is a placeholder: `[HERO VIDEO]`, `[PROPERTY IMAGE]`, `[AGENT IMAGE]`, `[LOCATION IMAGE]`, `[HEADLINE]`, `[DESCRIPTION]`, `[BRAND MARK]`.

## 1. Header and navigation

The header is a floating pill, fixed 16 px from the top and sides, that never hides. It is transparent over the hero and becomes an 85%-opaque brand-colour pill the moment the page scrolls.

### Structure (desktop, measured at 1527 px)

| Property | Value |
| --- | --- |
| Position | `position: fixed; top: 16px; left: 16px; right: 16px; z-index` above all content |
| Size | 106 px tall, full width minus 32 px |
| Shape | `border-radius: 100px` |
| Inner padding | 8 px top/bottom, 16 px right, 43 px left |
| Layout | One flex row, `justify-content: space-between`: logo, primary links, action cluster |
| Logo | Left, about 170 px wide, vertically centred |
| Primary links | 5 links plus a phone number, starting 28 px after the logo. 14 px / weight 700 / sentence case / 8×16 px padding each |
| Dropdown | One link carries a chevron. Hover opens a small white card (two links, 14 px, dark text) directly below; chevron flips |
| Action cluster | Search pill (outline, icon + label), solid white pill CTA, 40 px circular account icon button, outlined "Menu" pill with a three-line icon |
| Outline style | `1px solid rgba(255,255,255,.24)` on transparent |

### States

| State | Background | Text / icons | When |
| --- | --- | --- | --- |
| Top of a dark-hero page | Transparent | White | `scrollY = 0` |
| Scrolled | Brand colour at 85% opacity (`rgba(0,26,114,.85)` on the reference). No blur, so content shows faintly through | White; the solid CTA stays white with brand-colour text | Any scroll above 0. A `scroll` class is toggled |
| Light variant (property page) | Solid white pill | Brand-colour text, brand-colour solid CTA | Top of pages with a busy or dark gallery |
| Hover on links | No background | Colour shifts over 0.3 s | Pointer devices |

The header stays visible on scroll down and scroll up. There is no shrink, no hide-on-scroll and no shadow. The state change is effectively a hard switch (0.2 s at most).

**Elevated option:** add `backdrop-filter: blur(12px)` to the scrolled state and fade the background over 0.3 s. Keep the pill size constant.

### Responsive header

| Width | Behaviour |
| --- | --- |
| 1280 px and up | Full row as above |
| About 1100 px | Primary links disappear. Logo plus the full action cluster remain. Height stays 106 px |
| 820 px | Height drops to 58 px. Logo, search pill, CTA pill, account icon, Menu pill |
| 390 px | Logo left; two 40 px circular icon buttons right (search, menu). Pill is 343 px wide |

### Main menu (desktop)

The Menu button opens a large white panel, not a full-bleed takeover.

| Property | Value |
| --- | --- |
| Container | Fixed overlay with 16 px padding; page behind is tinted with the brand colour; `body` scroll is locked |
| Panel | White, `border-radius: 36px`, about 89% of viewport height, internal scroll if needed |
| Entrance | Panel translates in from the right (`translateX(100%)` to `0`). No fade, no item stagger. Appears near-instant |
| Top row | Logo left (brand colour). Right: phone pill (outline), primary CTA pill (solid), 40 px circular close button |
| Left third | Decorative `[LIFESTYLE IMAGE]` cut into the shape of the `[BRAND MARK]`, bleeding off the left and bottom edges |
| Centre column | 8 primary links, 32 px / weight 800 / brand colour, about 13 px between rows. One link carries an external-link icon |
| Right column | 474 px wide, separated by a 1 px vertical rule. Three groups, each with a 12 px uppercase grey label and 14 px / 700 links in two columns |
| Bottom of right column | Two 56 px pill buttons: solid with lock icon, outline with chevron |

**Elevated option for the menu:** slide the panel over 0.6 s with `power3.out`, fade the tint over 0.3 s, then reveal the 8 primary links from clipped rows (`yPercent: 100` to `0`) with a 0.05 s stagger. Reverse in 0.35 s on close.

### Mobile menu (390 px)

Same white rounded panel, same 16 px inset, scrolling internally. Order from top: logo, search circle (solid brand colour), close circle; a small "call us" label and phone number; the two pill buttons side by side; primary links at about 22 px / 800 with about 30 px row pitch; then the grouped link lists. The decorative image is dropped.

### Search overlay

The header search pill and the hero search bar both open a full-screen white overlay: a large "search" heading (h1 size, brand colour) top-left, a 40 px circular close button top-right, a full-width input, then a three-column discovery panel on off-white: one large `[PROPERTY IMAGE]` card, a column of two portrait `[DEVELOPMENT IMAGE]` cards, and a column with a small CTA banner plus a list of five thumbnail rows (image left, price and address right).

## 2. Hero

The hero is an 80vh autoplaying video with a centred headline and one oversized white search pill. The cinematic feel comes from the footage itself (fast-cut brand film) and a black fade at the bottom, not from any web animation.

### Measured values (desktop)

| Property | Value |
| --- | --- |
| Height | 80vh (705 px at an 881 px viewport). Not full-screen: the next section's rounded top is visible on load |
| Media | `<video>` absolutely filling the section. `object-fit: cover; object-position: 50% 0` (anchored to the top so faces are not cropped) |
| Video attributes | `autoplay muted loop playsinline`, `preload="metadata"`, poster image set, three `<source>` elements |
| Overlay | Flat `rgba(0,0,0,.3)` over the whole frame, plus a gradient to solid black across roughly the bottom 25% |
| Content block | Flex-centred column, 100 px top/bottom padding, 80 px side padding |
| Headline | `[HEADLINE]`, two lines, centred. 68 px / weight 800 / line-height 1.12 / letter-spacing -1.5 px / white / sentence case |
| Subline | `[DESCRIPTION]`, one line. 16 px / weight 700 / white. 16 px below the headline |
| Search bar | 735 × 88 px white pill (`border-radius: 500px`), padding 16 px (32 px left). Grey 16 px placeholder left; a 20 px locate icon and a 56 px solid brand-colour circular search button right |
| Search behaviour | The whole bar is one link: clicking anywhere opens the search overlay (section 1) |
| Gap headline to search | About 32 px |

### Motion

| Aspect | Faithful (observed) | Elevated (optional) |
| --- | --- | --- |
| Entrance | None on headline, subline or search. Only the header logo runs a 1 s `fadeInUp` | Sequence in section 16, Animation 12 |
| Background movement | None from code. The video's own cuts carry the motion | Scale media 1.08 to 1 over 1.6 s on load |
| Scroll behaviour | Hero scrolls away normally. No parallax, no pin, no scale | Media `yPercent` 0 to 12 and overlay 0.3 to 0.55, scrubbed over the hero's exit |

### Hand-off to the next section

The next section is an off-white sheet with `border-radius: 48px 48px 0 0` (32 px on mobile). Because the hero fades to solid black at its base, the sheet's rounded corners read as a card sliding over the film. There is no negative margin; the black gradient does the work. Reproduce this exactly: it is the main reason the page feels continuous rather than stacked.

### Hero variant seen on an inner landing page

Height about 89vh. Headline bottom-left at h1 size instead of centred. A solid pill "jump to" button with a down chevron below it. A 40 px circular mute/unmute toggle bottom-right. The same rounded white sheet follows. Animated captions seen there are baked into the video file, not built in HTML.

### Responsive hero

| Width | Height | Headline | Search bar |
| --- | --- | --- | --- |
| 1280 and 1100 px | 80vh | 68 px | 735 px wide, 88 px tall |
| 820 px | 80vh | 68 px (unchanged) | Full container width |
| 390 px | About 540 px, content-driven | 36 px / line-height 1.0 | 335 × 64 px, 12 px padding, placeholder truncates with ellipsis |

## 3. Homepage, section by section

The homepage is 14 content blocks plus header and footer, about 15,100 px tall at desktop and 20,000 px at 390 px. Three of the blocks are video bands, and the background alternates film, light, black and brand colour so no two neighbours look alike.

All heights below are at a 1527×881 viewport. The standard container has 80 px side gutters (24 px at tablet, 20 px at mobile), giving 1352 px of content.

| # | Block | Height | Background |
| --- | --- | --- | --- |
| 1 | Hero video + search | 705 px (80vh) | Film, fading to black |
| 2 | Regions link grid | 453 px | Off-white `#f7f7f7`, top corners rounded 48 px |
| 3 | Featured properties grid | 1865 px | White |
| 4 | Media feature banner | 894 px | Black |
| 5 | Sub-brand video band | 600 px | Film |
| 6 | Signature listings grid | 1329 px | Black |
| 7 | Developments accordion carousel | 1183 px | White |
| 8 | Services video band | 700 px | Film |
| 9 | Network + stats + globe | 1042 px | White |
| 10 | Product promo | 805 px | Brand-colour gradient |
| 11 | Recruitment split | 868 px | Off-white |
| 12 | Press logo marquee | 266 px | Off-white |
| 13 | Press quotes slider | 769 px | Off-white |
| 14 | Contact form | 1015 px | Deep brand colour |

### 3.1 Regions link grid

**Purpose:** fastest route from the hero to a market page.

- **Layout:** 64 px top and bottom padding. Heading (h2, 48 px / 800, brand colour), then a 5-column CSS grid with 8 px gaps. 19 chips on the reference.
- **Chip:** 264 × 48 px, white, `border-radius: 8px`, shadow `0 4px 8px rgba(0,0,0,.02)`, centred 16 px / 700 brand-colour label. Chips with child markets add a 16 px chevron.
- **Hover:** chip inverts to solid brand colour with white text over 0.3 s `ease-out`. At the same time a `[LOCATION IMAGE]` for that chip fades in (opacity 0 to 1, 0.6 s) in an absolutely positioned panel covering the right 60% of the section at full section height. The image's left edge dissolves into the off-white background through a horizontal gradient, so chips stay readable on top of it.
- **Click on a chevron chip:** a white list drops below it (absolute, same width, `border-radius: 0 0 8px 8px`, 12×16 px padding). Opacity and visibility transition 0.3 s. Links are 14 px, centred; the last is "all of \[REGION\]". Chevron rotates 90°.
- **Scroll motion:** none.
- **Responsive:** 5 columns down to 1025 px, 3 at 820 px, 2 at 390 px. No hover image on touch.

### 3.2 Featured properties grid

**Purpose:** nine hero listings in a calm editorial grid.

- **Layout:** 112 px top and bottom padding. Header block left-aligned, max 647 px: h2 then a two-line 16 px grey description. 40 px below, a 3-column grid, 48 px gaps, 3 rows.
- **Card:** see section 5, "Light card".
- **Footer of block:** one solid pill button with chevron, left-aligned, about 48 px below the grid.
- **Scroll motion:** none. **Elevated:** cards rise 40 px and fade, staggered 0.08 s per column.
- **Responsive:** 2 columns with 32 px gaps at 1100 and 820 px; 1 column at 390 px.

### 3.3 Media feature banner

**Purpose:** one large editorial promotion (a show, film or campaign).

- **Layout:** black band. A `[FEATURE IMAGE]` fills the 1352 px container at 894 px tall (about 3:2), with a gradient to black over the bottom third.
- **Content, bottom-left, 80 px inset:** kicker (24 px, regular, uppercase), h2 (48 px / 800, white), then a 16 px / 700 line with an inline partner logo.
- **Content, bottom-right:** 12 px uppercase label beside a 96 px circular outline button with a chevron.
- **Motion:** none observed. **Elevated:** image scales 1.1 to 1 scrubbed while the band crosses the viewport.

### 3.4 Sub-brand video band

**Purpose:** introduces the premium division and sets up the black grid that follows.

- **Layout:** 600 px tall, full-bleed `[BAND VIDEO]` with overlay. Centred column: `[SUB-BRAND LOCKUP]`, then a two-line 16 px white description, max 640 px wide.
- **Decoration:** a very large outline `[BRAND MARK]` at low opacity, bottom-right, partly cropped by the section edge.
- **Hand-off:** 30 px of black, then block 3.5 with no heading of its own. The band acts as that grid's title.

### 3.5 Signature listings grid (dark)

**Purpose:** the cinematic listing presentation. Photo-first, text on image.

- **Layout:** black. 48 px top padding. 3 columns × 2 rows of tall cards with 20 px gaps. Centred white pill button 48 px below. About 96 px bottom padding.
- **Card:** see section 5, "Immersive card".
- **Responsive:** 2 columns at 820 px (388 × 442 px cards); 1 column at 390 px (335 × 402 px), where the spec row becomes three number-over-label columns.

### 3.6 Developments accordion carousel

**Purpose:** the page's signature interaction. A filmstrip of projects where the hovered card widens into a feature card.

- **Layout:** white. Header block max 600 px: two-line h2 and a one-line 16 px description. 40 px below, a full-bleed carousel (cards run edge to edge, past the container). 40 px below that, a control row inside the container: two 56 px circular outline arrow buttons left (8 px apart), a solid pill with chevron right.
- **Card at rest:** 242 × 480 px, 18 px gap, `border-radius: 8px`, full-cover `[DEVELOPMENT IMAGE]`, dark gradient at the base, 20 px padding. Bottom-left: title (24 px / 800, white, up to 3 lines) and a location row (12 px uppercase 700 with a pin icon).
- **Card on hover:** width 242 to 600 px and height 480 to 540 px over 0.5 s. Title font-size 24 to 48 px over 0.6 s. A short `[DESCRIPTION]` line fades in below the location over 0.5 s. Neighbours slide sideways to make room; the row's height is reserved at 540 px so nothing below jumps.
- **Carousel:** variable-width slides, centred, infinite loop, drag and swipe-to-slide, 0.3 s `ease` per step, no autoplay, no dots. 24 slides on the reference.
- **Responsive:** at 390 px cards are 156 × 217 px with an 18 px title, no expansion, swipe only; arrows shrink to 40 px.

### 3.7 Services video band

**Purpose:** three service lines presented over a second film.

- **Layout:** 700 px tall, full-bleed `[BAND VIDEO]`, overlay `rgba(0,0,0,.1)`. h2 (48 px, white) top-left, 80 px from the top. A 40 px circular mute toggle top-right. Three cards pinned to the bottom of the band (`align-items: flex-end`), 32 px gaps, each one third of the container.
- **Card at rest:** transparent, `1px solid rgba(255,255,255,.24)`, 8 px radius, 16 px padding, 114 px tall. Label (14 px / 700 / uppercase / 0.02em tracking) and a two-line title (20 px / 800), white.
- **Card on hover:** background becomes off-white, text becomes dark grey, and the card grows upward to about 260 px as a hidden region opens (`max-height` 0 to 300 px, 0.3 s `ease-in-out`). The region holds a 14 px paragraph and a solid pill CTA. Because cards are bottom-aligned, growth goes up into the film.
- **Responsive:** band becomes 844 px tall at 390 px. Cards become a horizontally scrolling row (238 px wide, 12 px gaps), first card open by default, CTA reduced to a chevron.

### 3.8 Network, stats and globe

**Purpose:** scale proof.

- **Layout:** white. Left column 600 px: kicker (14 px / 700 / uppercase / grey), h3 (32 px / 800, brand colour, two lines), 16 px grey paragraph, a `[PARTNER LOGO]` about 165 px wide, a 2 × 2 stat grid, then a solid pill CTA.
- **Stat:** value 48 px / 800 brand colour; label 16 px / 700 black directly beneath. Rows about 140 px apart.
- **Right side:** a `<canvas>` the size of the whole section, shifted so a dot-matrix globe sits right of centre and bleeds off the right edge. It rotates slowly and continuously.
- **Motion:** each stat value runs `fadeInUp` (starts 100% of its own height lower, opacity 0) and counts up from 0 once it enters the viewport. Delays 0, 0.1, 0.2, 0.3 s across the four. Labels fade in.
- **Responsive:** stat values 24 px at 390 px; globe moves behind and below the text.

### 3.9 Product promo

**Purpose:** one product or app.

- **Layout:** 805 px, diagonal gradient from deep brand colour to a lighter, more saturated tint. Inner block 1032 px wide, two columns, 64 px gap: `[DEVICE MOCKUPS]` left (507 × 581 px), copy right (461 px): `[PRODUCT LOGO]` 32 px tall, three-line h2 (white), 16 px paragraph, one bold 16 px line, white pill CTA.
- **Motion:** none.

### 3.10 Recruitment split

**Purpose:** secondary audience CTA.

- **Layout:** off-white, 96 px padding, two equal 676 px columns. Left: a square `[LIFESTYLE IMAGE]` cut into the `[BRAND MARK]` shape, washed out, shifted 169 px off the left edge. Right: text block inset 80 px, vertically centred: grey uppercase kicker, three-line h2 (max 500 px wide), 16 px paragraph, two pill buttons side by side (one solid, one tonal grey).
- **Motion:** none.

### 3.11 Press logo marquee

- **Layout:** 266 px band. A 12 px uppercase label at the far left, then `[PRESS LOGO]` items about 105 px tall in a single row, monochrome, running edge to edge. Hairline rule beneath.
- **Motion:** continuous linear leftward scroll, infinite, no pause on hover (10 s per slide step, zero dwell).

### 3.12 Press quotes slider

- **Layout:** 112 px padding. h2 and a three-line description (max 676 px). Slider of text-only cards, 3 visible. Control row: arrow pair left, solid pill right.
- **Card:** 1 px top rule, 48 px above the content, source label (12 px uppercase 700), quote title (24 px / 800, black, clamped to 3 lines with ellipsis), then a "read" text link with chevron (14 px / 700, brand colour).
- **Slider:** 0.5 s per step, one card per step, not infinite, no dots. 2 visible at 1200 px and below, 1.4 visible at 768 px and below so the next card peeks.

### 3.13 Contact form

- **Layout:** deep brand colour, 1015 px. Inner block 1180 px wide, two columns, 80 px gap. Left (464 px): white h2, vertically centred, sitting on a giant photo-filled `[BRAND MARK]` at low opacity that is cropped by the bottom edge. Right: white form card 568 px wide, 8 px radius, starting 80 px from the top.
- **Form:** name, email, phone, topic select, message textarea (56 px tall fields, 8 px radius, 1 px grey border, 16 px gaps), consent checkbox with 10 px legal text, solid pill submit left-aligned.

## 4. Scroll and motion behaviour

Only one homepage block animates because of scroll: the stats. Everything else that moves is triggered by hover, by a carousel, or runs continuously. The motion character is short (0.3 to 0.6 s), eased out, and always attached to a pointer action.

### Motion that exists on the reference

| Motion | Trigger | From → to | Scroll relation | Timing | Build with |
| --- | --- | --- | --- | --- | --- |
| Header state | `scrollY > 0` | Transparent → brand colour at 85% | Threshold toggle, reversible | Up to 0.2 s | CSS class set by a scroll listener or `IntersectionObserver` sentinel |
| Logo entrance | Page load | Opacity 0, `translateY(100%)` → visible | Once | 1 s, default ease | CSS keyframes |
| Stat entrance | Element enters viewport | Opacity 0, `translateY(100%)` → visible | Once, not scrubbed | 1 s; stagger 0.1 s over four items | GSAP ScrollTrigger `once: true`, or `IntersectionObserver` + CSS |
| Stat count-up | Same moment | 0 → target number, suffix kept | Once | About 2 s | GSAP tween on a number proxy |
| Region image reveal | Hover a chip | Image opacity 0 → 1; chip colours invert | None | 0.6 s image, 0.3 s chip, `ease-out` | CSS |
| Region sub-list | Click a chevron chip | Opacity and visibility 0 → 1 | None | 0.3 s | CSS + small state |
| Light card zoom | Hover a card | Image `scale(1)` → `scale(1.1)` inside a clipped frame | None | 0.3 s `ease-out` | CSS, inside `@media (hover:hover) and (pointer:fine)` |
| Immersive card zoom | Hover a card | Image scale 1 → about 1.07, image darkens | None | 0.3 s `ease-out` | CSS |
| Accordion card | Hover a slide | 242×480 → 600×540 px; title 24 → 48 px; description opacity 0 → 1 | None | 0.5 s size, 0.6 s title, 0.5 s description | CSS transitions on a flex row inside a carousel |
| Service card | Hover a card | Glass outline → off-white fill; hidden region `max-height` 0 → 300 px | None | 0.3 s `ease-in-out` | CSS (`grid-template-rows: 0fr → 1fr` is the modern equivalent) |
| Carousel step | Arrow, drag or swipe | Track translates one slide | None | 0.3 s (developments), 0.5 s (press), `ease` | Swiper or Embla |
| Logo marquee | Always | Track translates left, loops | None | Linear, constant speed | CSS `@keyframes` on a duplicated track |
| Globe | Always | Rotates about its vertical axis | None | Slow, constant | Canvas, lazy-loaded |
| Menu panel | Click Menu | `translateX(100%)` → 0; page tinted; scroll locked | None | Near-instant | CSS or GSAP timeline |
| Buttons | Hover | Background shifts to a brighter brand tint | None | 0.3 s `ease-out`, all properties | CSS |
| Anchor jumps | Click an in-page link | Native smooth scroll | n/a | Browser default | CSS `scroll-behavior: smooth` |
| Sticky enquiry card (property page) | Scroll | Card holds at `top: 128px` while the left column scrolls | Continuous | n/a | CSS `position: sticky` |

### Motion that does not exist on the reference, with the Elevated equivalent

Use these only if the new brand wants more scroll drama than the reference has. Each is specified in section 16.

| You asked about | Elevated treatment that fits this design language |
| --- | --- |
| Line-by-line heading reveals | Every section h2 splits into lines; each line rises from a clipped row. Once per page view |
| Image mask reveal | Promo banner and split-section images open with `clip-path: inset(100% 0 0 0)` → `inset(0)` |
| Image scale on scroll | Video bands and the media banner scale 1.12 → 1, scrubbed |
| Parallax | Hero media only, `yPercent` 0 → 12, scrubbed |
| Sequential cards | Grid cards rise and fade with a per-column stagger |
| Pinned section | One only: the services band pins for 150vh while the three cards open in turn. Desktop only |
| Background-colour transition | One only: page background interpolates white → black as the signature grid approaches |
| Smooth scroll | Lenis on desktop pointers, off for touch and reduced motion |

Not recommended for this language: section snapping, horizontal-scroll hijacking, custom cursors, word-by-word reveals on body copy. They fight the fast, direct feel of the reference.

## 5. Property listing components

The reference uses three card types, and the premium feel comes from restraint: no borders, no shadows, no card background, no icons for beds and baths. The photo and four lines of type do all the work.

### The three cards

|  | Light card | Immersive card | Accordion card |
| --- | --- | --- | --- |
| Used in | Featured grid on white | Signature grid on black | Developments carousel |
| Size at desktop | 419 px wide; image 419 × 283 px | 437 × 525 px | 242 × 480 px at rest, 600 × 540 px on hover |
| Image ratio | 400:270 (about 3:2) | About 5:6 portrait | About 1:2 portrait, opening to 10:9 |
| Radius | 8 px on the image only | 8 px on the whole card | 8 px |
| Text position | Below the image | On the image, bottom-left, over a dark gradient | On the image, bottom-left |
| Line 1 | Price, 16 px / 700, black | Price, 18 px / 400, white | Name, 24 px / 800, white (48 px on hover) |
| Line 2 | Address, 16 px / 400 | Address, 12 px / 400 | Location, 12 px / 700 uppercase with pin icon |
| Line 3 | Specs, 12 px / 700 uppercase, separated by round bullets | Specs, 12 px / 400, separated by middots | One-line description, hover only |
| Status tag | Top-left, 16 px inset: white chip, 4 px radius, 12 px / 700 uppercase brand-colour text | Top-left, flush to the corner, shaped as a tab with one rounded outer corner | None |
| Collection label | Bottom-left of the image, flush to the corner: black tab, white 16 px text, top-right corner rounded | None | None |
| Hover | Image scales to 1.1 in 0.3 s inside a clipped frame | Image scales to about 1.07 and darkens, 0.3 s | Card expands (section 3.6) |
| Link target | Whole card | Whole card | Whole card |

### Details that make them read as premium

- Price leads. The address is secondary and the specs are the smallest text on the card.
- Specs are plain uppercase text with dot separators. No bed, bath or area icons anywhere.
- The "tab" shapes (status and collection labels) sit flush in the image corner and round only the corner that faces into the photo. This is a recurring motif; reuse it for any on-image label.
- Listing-source logos and courtesy lines, where required, are small and pushed to the bottom-right of the text block or overlaid at 12 px on the image.
- Grids are generous: 48 px gaps on white, 20 px on black where the photos touch-read as a wall.

### Sliders and controls

- Arrow buttons are 56 px circles, 1 px outline, transparent fill, a small chevron centred. They sit bottom-left under the carousel, 8 px apart, never overlaid on the images. 40 px on mobile.
- The "view all" action is a solid pill on the same row, right-aligned.
- Drag with the mouse and swipe on touch are both enabled. No pagination dots anywhere.

### Property detail page (for the same card language)

Sizes in this list are visual estimates from screenshots, except the sticky offset, which was measured.

- Black top area. Breadcrumb in 12 px white. A gallery mosaic: one large image (about 62% width, 3:2) plus a 2 × 2 grid of thumbnails with 16 px gaps and 8 px radii; the last thumbnail is darkened and labelled "view all photos".
- Below the mosaic, still on black: address as h3 (32 px / 800, white), small address line, price (20 px / 800, grey-white), spec row in the same uppercase dotted style, and two small outline pills (share, external site).
- A sub-navigation row (three anchor links left, an outline pill and a solid pill right) follows and stays under the header.
- Body on white: two columns. Left about 62%: h2 headings in brand colour, description, a definition table with hairline row dividers, feature lists in two columns. Right: a sticky card (`top: 128px`) in solid brand colour with a three-day date picker (large numerals in outline boxes), a time select, a two-option segmented toggle, and a pill button. Agent contact cards follow beneath it.
- Then: full-width map, a full-bleed `[LOCATION IMAGE]` band, a brand-colour contact block with an `[AGENT IMAGE]` card and the same form card as the homepage, and a carousel of other listings.

### Mobile

Light cards go single column at full container width with the same 3:2 image. Immersive cards go single column at 335 × 402 px and restructure specs into three columns. Accordion cards shrink to 156 × 217 px in a swipe row. Hover zoom is disabled on touch by the media query.

## 6. Location and area sections

The reference treats locations as typography first and photography second: a dense grid of text chips, with the photo appearing only on hover as a backdrop. There is no grid of location image cards on the homepage.

### Regions block (homepage)

| Aspect | Behaviour |
| --- | --- |
| Default view | Heading plus a 5-column grid of white text chips on off-white. No imagery visible |
| Photography | One `[LOCATION IMAGE]` per chip, stacked in the same absolutely positioned panel: right 60% of the section, full section height, `object-fit: cover`, centred |
| Reveal | Hovering a chip fades its image from opacity 0 to 1 in 0.6 s. Leaving fades it out. Only one is visible at a time |
| Photo-to-type relationship | The image's left edge fades to the section background, so the two right-hand chip columns sit on the photo while the three left-hand columns stay on flat colour. Chips keep their white fill, so text never sits directly on the photo |
| Active chip | Solid brand colour, white text |
| Sub-markets | Chips with a chevron open a plain text list on click (section 3.1) |
| Scroll movement | None |
| Carousel | None |
| Touch | No image reveal. Chips are plain links or toggles in 2 columns |

### Location imagery elsewhere

- **Development cards** carry the location as a 12 px uppercase line with a pin icon under the project name (section 5).
- **Property page** uses a full-width map followed by a full-bleed `[LOCATION IMAGE]` band of about 60vh with no text over it.
- **Search overlay** lists developments with the neighbourhood as a second line under the name.

### Elevated option: neighbourhood showcase

If the new brand has fewer than about eight areas, the chip grid will look thin. Replace it with the accordion pattern from section 3.6 applied to areas: tall `[LOCATION IMAGE]` cards, area name bottom-left at 24 px / 800, expanding on hover to reveal a one-line description and a listing count. This reuses an existing component and keeps the page language consistent.

## 7. Typography

One geometric sans-serif family at four weights carries the whole site. Headings are weight 800, sentence case, tightly tracked and coloured with the brand colour on light backgrounds. There is no serif, no display face and no all-caps headline.

### Scale (measured from the stylesheet)

| Role | Desktop size | Line-height | Letter-spacing | Weight | At 560 px and below |
| --- | --- | --- | --- | --- | --- |
| h1 (hero) | 68 px (4.25rem) | 1.12 | -1.5 px | 800 | 36 px, line-height 1.0 |
| h2 (section) | 48 px (3rem) | 1.24 | -1.5% | 800 | 24 px, line-height 1.25 |
| h3 | 32 px (2rem) | 1.14 | -0.5% | 800 | 21 px, line-height 1.43 |
| h4 | 24 px (1.5rem) | 1.31 | normal | 800 | 18 px, line-height 1.33 |
| h5 | 20 px (1.25rem) | 1.325 | normal | 800 | 16 px |
| Body | 16 px | 1.5 | normal | 500 | 14 px, line-height 1.43 |
| Small body | 14 px | 1.43 | normal | 500 | 14 px |
| Button / nav link | 14 px | 1.43 | normal | 700 | 14 px |
| Kicker / label | 14 px or 12 px, uppercase | 1.2 to 1.33 | 0.02em | 700 | 12 px or 10 px |
| Tag | 12 px, uppercase | 1.33 | normal | 700 | 10 px |

### Rules

- **Case:** sentence or title case for all headings. Uppercase is reserved for 12 to 14 px labels, tags and spec rows.
- **Colour:** headings are brand colour on white and off-white, white on film, black and brand-colour backgrounds. Body is dark grey (`#484848`) on light, white on dark. Kickers are mid-grey (`#787878`).
- **Alignment:** left everywhere except the hero and the sub-brand band, which are centred.
- **Measure:** heading blocks are capped at about 600 to 680 px wide so h2s break into two lines. Paragraphs are capped at about 600 px.
- **Scaling:** sizes step down once at 560 px. They do not shrink at tablet: the hero stays 68 px at 820 px. Above 1980 px every size becomes fluid (`h1: clamp(4.25rem, 4.3vw, 13.75rem)`, `h2: clamp(3rem, 1.875vw, 6rem)`, body up to 2rem) so the layout scales on very large screens.
- **Scale character:** the largest type is 68 px. The site reads as bold because of weight 800 and tight tracking, not because of oversized display type.

### Animated headings

None on the reference; headings are static. The Elevated line reveal is specified in section 16, Animation 13.

### Font choice

The reference font is Montserrat, which is free on Google Fonts, so it can be used directly. To give the new brand its own voice with the same proportions, pick one of these:

| Font | Source | Why it fits |
| --- | --- | --- |
| Montserrat | Google Fonts | The reference face. Wide geometric forms, strong 800 |
| Plus Jakarta Sans | Google Fonts | Slightly narrower, more contemporary, good 800 |
| Red Hat Display | Google Fonts | Sharper geometry, has 800 and 900 |
| Outfit | Google Fonts | Cleaner and lighter in feel, variable weight |
| Satoshi | Fontshare | Modern grotesque-geometric hybrid; top weight is Black (900) |
| General Sans | Fontshare | Neutral, compact; use Bold or Semibold for headings |
| Switzer | Fontshare | Closest to a neutral grotesque if the new logo is Helvetica-like |

Load one family only, as a variable font if available, with `font-display: swap` and weights 500, 700 and 800 subsetted to Latin.

## 8. Image and video behaviour

Three autoplaying, muted, looping videos carry the page's sense of motion, and every still image is a hard-edged, 8 px-radius rectangle with `object-fit: cover`. The only non-rectangular images are photos cut into the brand mark.

### Video

| Aspect | Reference behaviour | Keep / change |
| --- | --- | --- |
| Placement | Three full-bleed bands: hero (80vh), sub-brand (600 px), services (700 px) | Keep. Three is the ceiling |
| Element | Native `<video>` absolutely filling its band | Keep |
| Attributes | `autoplay muted loop playsinline`, poster, `preload="metadata"`, multiple sources | Keep; add AV1 or WebM first, MP4 fallback |
| Fit | `object-fit: cover`; hero uses `object-position: 50% 0` | Keep. Set object-position per video to protect faces |
| Overlay | Hero 30% black + bottom gradient to black; services 10% black; sub-brand medium dark | Keep as tokens |
| Sound | Services band and inner-page hero show a 40 px circular mute toggle; hero has none | Keep; default muted |
| Off-screen | Not verified on the reference | Pause when out of view |
| Content style | Fast-cut brand film with people, not slow drone footage | Brief the client for `[HERO VIDEO]` in this style, 15 to 30 s loop |

### Still images

| Context | Ratio | Fit | Notes |
| --- | --- | --- | --- |
| Light property card | 400:270 (about 3:2) | cover | 8 px radius, clipped for hover zoom |
| Immersive property card | About 5:6 portrait | cover | Bottom gradient for text |
| Accordion card | About 1:2 at rest, 10:9 open | cover, centred | The image re-crops as the frame widens, so more of the photo is revealed rather than stretched |
| Media banner | About 3:2, container width | cover | Bottom third fades to black |
| Region backdrop | Right 60% of section, full height | cover, centred | Left edge fades to the background colour |
| Brand-mark photo | Square source | Pre-cut to the mark's shape (transparent PNG or SVG mask) | Used in menu, recruitment split, contact block. Bleeds off an edge. Washed to 40% opacity on light backgrounds |
| Property gallery lead | About 3:2 | cover | With a 2 × 2 thumbnail mosaic |

### Loading

- Card images use native `loading="lazy"`. The reference serves a single source per image (no `srcset`); the rebuild should serve responsive sizes.
- Region backdrop images and menu imagery are in the DOM from load at opacity 0. In the rebuild, load them on first hover or when the section nears the viewport.

### Transitions on media

- Hover scale: 1.05 to 1.1, 0.3 to 0.4 s, inside `overflow: hidden`.
- Crossfade: 0.5 to 0.6 s opacity for swapped backdrops.
- No parallax, no scroll scaling, no mask animation on the reference (Elevated options in section 16).

## 9. Buttons and micro-interactions

Every control is a pill or a circle, and every hover is a 0.3 s `ease-out` colour change. Nothing slides, underlines, magnetises or follows the cursor.

### Button inventory

| Control | Size | Shape | Rest | Hover |
| --- | --- | --- | --- | --- |
| Primary pill | 56 px tall, 24 to 32 px side padding; 40 px tall on mobile | `border-radius: 100px` | Solid brand colour (`#001a72`), white 14 px / 700 label | Brighter brand tint (`#002fcf`); pressed `#0028af` |
| Primary pill with icon | Same | Same | Label, 16 px gap, chevron or icon right | Same colour change; icon does not move |
| Inverse pill | Same | Same | Solid white, brand-colour label (on film, black or brand backgrounds) | Light grey fill |
| Outline pill | Same | Same | Transparent, 1 px border at 16% black (or 24% white on dark) | Border strengthens |
| Tonal pill | Same | Same | Light grey fill, brand-colour label | Darker grey |
| Circle arrow | 56 px; 40 px on mobile | Circle | 1 px outline, chevron centred | Fill or border strengthens |
| Large circle action | 96 px | Circle | 1 px white outline, chevron | Same |
| Circle icon button | 40 px | Circle | Outline; used for account, close, mute | Same |
| Search submit | 56 px | Circle | Solid brand colour, white icon | Brighter tint |
| Chip | 48 px tall | 8 px radius | White, faint shadow, brand-colour 16 px / 700 label | Inverts to solid brand colour |
| Text link with chevron | 14 px / 700 | None | Brand colour, chevron 8 px right | Colour shifts |
| Focus (all) | n/a | n/a | n/a | Visible ring: darker fill plus `box-shadow` halo |

Hover values for the primary pill, inverse pill, chip and search submit were measured. Hovers for the outline pill, tonal pill and circle buttons were not captured, so those cells are the rule for the rebuild.

### Shared behaviour

- `transition: all .3s ease-out` on every button. Chips and service cards use the same 0.3 s.
- Labels never wrap (`white-space: nowrap`, ellipsis on overflow).
- Disabled state is a pale tint of the brand colour with pale text.
- Icons are 16 to 20 px line icons, always to the right of the label.

### Elevated micro-interactions (optional, pick at most two)

- **Chevron nudge:** on hover the chevron translates 4 px right over 0.3 s. Fits the direct tone.
- **Circle arrow fill:** a solid disc scales from 0 to 1 behind the chevron, and the chevron inverts colour.
- **Text link underline:** a 2 px line grows left to right under the label. The reference stylesheet contains this pattern but the homepage does not use it.

## 10. Transitions between sections

The page reads as one experience because of five compositional devices, none of which is an animation. Reproduce all five before adding any scroll effect.

| Device | How the reference does it | Rule for the rebuild |
| --- | --- | --- |
| Rounded sheet over film | The section after a video hero has 48 px top corners and sits on the hero's black fade | Every page that opens with film or a dark gallery ends that block in black and starts the next with a rounded sheet |
| Film as chapter title | Video bands sit directly above the block they introduce, with no heading on the block below | Use a band, not an h2, to open the signature grid |
| Background rhythm | Film → off-white → white → black → film → black → white → film → white → gradient → off-white → brand colour | Never place two white blocks in a row without a tone change; never run more than about 2 viewport heights without a dark or film block |
| Edge-bleeding elements | The carousel runs past the container to both screen edges; the globe and the brand-mark photos are cropped by the section edge | At least one element in every second block breaks the container |
| Repeated motifs | Pill and circle controls, the corner "tab" label, the brand mark as watermark, mask and backdrop | The same four motifs appear in the header, cards, menu, contact block and footer |

### Spacing between blocks

- Blocks touch; there are no margins between sections. Separation is by background colour only.
- Inside a block, vertical padding is 112 px for major blocks, 96 px for standard ones and 64 px for compact ones (regions).
- Within a block the rhythm is: header group, 40 px, main component, 40 to 48 px, control or CTA row.
- Light blocks that follow each other (off-white to off-white) are separated by a 1 px hairline.

### Scroll timing

Native scroll with no smoothing. Because nothing is pinned or scrubbed, scroll speed is entirely the user's.

### Elevated transitions (optional)

- **Sheet lift:** give the rounded sheet `margin-top: -48px` and a higher z-index, and let the hero media move at 88% of scroll speed, so the sheet physically slides over the film.
- **Tone crossfade:** interpolate the page background from white to black over the last 30vh before the signature band. One place only.
- **Band reveal:** each video band's media scales 1.12 to 1 while it enters, so film blocks feel like they are settling into place.

## 11. Footer

The footer is light, not dark: an off-white newsletter band, a white sitemap that mirrors the main menu, then small-print. There is no oversized wordmark; the large-type moment is the column of primary links at 24 px / 800.

| Band | Layout | Type and controls |
| --- | --- | --- |
| Newsletter | Off-white, about 300 px tall, 40 px padding. Inner block 1180 px, two columns, 80 px gap | Left: `[NEWSLETTER HEADLINE]` at h5 (20 px / 800, brand colour), two short statements. Right (568 px): one email field with a circular arrow submit button inside its right edge, then a consent checkbox with 12 px legal text |
| Sitemap | White, 80 px top padding, one row | Far left (192 px): two stacked 56 px pills, 24 px apart (solid with chevron, outline with lock icon). From about 30% across: a column of 8 primary links at 24 px / 800 brand colour, then three columns (231 px each, 32 px gaps) with a 12 px uppercase grey label and 14 px / 700 brand-colour links |
| Brand row | Hairline above. One row | Left: small logo (about 160 px) and a 12 px copyright line. Right: six 40 px circular outline social icon buttons |
| Legal | White | 12 px italic disclaimer paragraphs, small compliance badges, a wrapping row of 12 px / 700 legal links, and a right-aligned platform credit |
| Regulatory small-print | White, very long | Listing-source logos, each followed by 12 px paragraphs. On the reference this is more than half the footer's height |

### Notes for the rebuild

- The primary-link column and the three grouped columns are the same data as the main menu. Drive both from one navigation config.
- The regulatory block is jurisdiction-specific to the reference's markets. Replace it with the new brand's own licensing and compliance text; expect it to be far shorter.
- No scroll animation, no back-to-top control, no map.

### Responsive footer

| Width | Behaviour |
| --- | --- |
| 1100 px and up | As above |
| 820 px | Newsletter stays two columns. Sitemap becomes a column: pills first, then link columns wrapping two or three per row |
| 390 px | Everything single column. Newsletter headline above the field. Pills full width. Primary links, then each group stacked. Social icons wrap. Footer is about 4,700 px tall on the reference because of the small-print |

### Elevated option

Add a full-width `[BRAND WORDMARK]` as the last element, sized with `font-size: clamp(4rem, 17vw, 20rem)` or as an SVG at 100% container width, in the brand colour at 8% opacity. Reveal it by translating up 30% as the footer enters. This gives the "large branding" finish the reference lacks.

## 12. Responsive behaviour

The reference has two real layout shifts: navigation collapses below about 1200 px, and type plus grids collapse at 560 to 768 px. Tablet keeps desktop type sizes on narrower grids.

Measured by loading the homepage at each width:

|  | 1527 px | 1280 px | 1100 px | 820 px | 390 px |
| --- | --- | --- | --- | --- | --- |
| Side gutter | 80 px | 80 px | 80 px | 24 px | 20 px |
| Header height | 106 px | 106 px | 106 px | 58 px | 92 px |
| Primary nav links | Shown | Shown | Hidden | Hidden | Hidden |
| Header actions | Search pill, CTA, account, Menu | Same | Same | Same, compact | Search circle, menu circle |
| Hero height | 80vh | 80vh | 80vh | 80vh | About 540 px |
| h1 | 68 px | 68 px | 68 px | 68 px | 36 px |
| h2 | 48 px | 48 px | 48 px | 48 px | 24 px |
| Major block padding | 112 px | 112 px | 112 px | 80 px | 56 px |
| Sheet corner radius | 48 px | 48 px | 48 px | 48 px | 32 px |
| Regions grid | 5 col | 5 col | 5 col | 3 col | 2 col |
| Featured grid | 3 col, 48 px gap | 3 col, 48 px gap | 2 col, 32 px gap | 2 col, 32 px gap | 1 col, 32 px gap |
| Immersive card | 437 × 525 | 355 × 426 | 453 × 543 (2 col) | 369 × 442 (2 col) | 335 × 402 (1 col) |
| Accordion card | 242 × 480, hover expands | Same | Same | 242 × 480 | 156 × 217, no expand |
| Service cards | 3 across, hover expand | 3 across | 3 across | Horizontal scroll row | Horizontal scroll row, 238 px cards |
| Stat value | 48 px | 48 px | 48 px | 48 px | 24 px |
| Page height | About 15,100 px |  |  | About 17,100 px | About 20,000 px |

### What makes mobile feel designed, not stacked

- The header stays a floating pill with two circular icon buttons; it does not become a full-width bar.
- The hero keeps the same composition (centred headline, pill search) at a fixed comfortable height instead of 100vh.
- The rounded sheet keeps its overlap at a smaller radius.
- Wide components become swipe rows rather than vertical stacks: accordion cards, service cards, press cards (1.4 visible so the next one peeks).
- The service band grows taller (844 px) so the film still dominates behind the cards.
- Immersive cards restructure their spec row into three labelled columns rather than shrinking the text.
- Buttons drop from 56 to 40 px tall; arrow circles from 56 to 40 px.

### How animation simplifies

- Hover-only effects (image zoom, region backdrop, accordion expand) are wrapped in `@media (hover: hover) and (pointer: fine)` and simply do not exist on touch.
- Service cards replace hover with one card open by default.
- The stat entrance and count-up run at every width.
- A `prefers-reduced-motion` rule in the stylesheet removes animation durations.

### Rules for widths the reference handles weakly

- **Tablet type:** 68 px h1 on an 820 px screen is heavy. In the rebuild use fluid type between 560 and 1280 px: `h1: clamp(2.25rem, 1rem + 4.2vw, 4.25rem)`, `h2: clamp(1.5rem, 0.9rem + 2.6vw, 3rem)`.
- **1024 to 1200 px:** the reference hides the nav but keeps a 106 px header. Drop to 72 px here.
- **Above 1980 px:** scale type and spacing with viewport width as the reference does, or cap the container at 1680 px and centre it.

## 13. Performance

The visual quality of the reference costs very little animation budget; the real weight is three videos, dozens of listing photos and a stack of legacy libraries. A modern rebuild can look the same and ship a fraction of the JavaScript.

### Where the reference is heavy, and the fix

| Cost on the reference | Fix in the rebuild |
| --- | --- |
| jQuery, two carousel libraries, WOW.js, GSAP, a templating library and a parallax plugin all load on the homepage | One carousel library, GSAP loaded only where used, CSS for everything hover-driven |
| Three video bands on one page | Hero video only on load. The other two get `preload="none"` and start when within 50% of a viewport |
| Off-screen video playback (not verified on the reference) | `IntersectionObserver` pauses any video that is not intersecting |
| One image source per card | `next/image` with AVIF then WebP, `sizes` matched to the grid (`(min-width:1280px) 30vw, (min-width:768px) 46vw, 92vw`) |
| Hidden hover backdrops and menu imagery load up front | Load on first hover intent, or when the section is within one viewport |
| Accordion card animates `width`, `height` and `font-size`, which triggers layout on every frame | Acceptable for one hovered card. Keep the row's height reserved, add `contain: layout` on the carousel, and limit the transition to the hovered card and its neighbours |
| Service card animates `max-height` | Use `grid-template-rows: 0fr → 1fr`, or animate `clip-path` plus `transform` |
| Globe canvas runs continuously | Lazy-load the script, render only while in view, cap device pixel ratio at 1.5, and swap to a static image on mobile or reduced motion |

### Rules

1. **Animate only `transform`, `opacity`, `clip-path` and `filter`.** The two layout animations above are the only exceptions.
2. **`will-change` sparingly:** set it on hover-zoom images and the menu panel just before they animate, and remove it afterwards.
3. **Hero video:** 1920 × 1080 maximum, 15 to 30 s loop, no audio track, 2 to 3 Mbps. Provide AV1 or WebM plus H.264 MP4. Serve a 720p file under 768 px via `media` on `<source>` or a JS swap. Target under 4 MB desktop and under 1.5 MB mobile.
4. **Poster first:** the poster is the LCP element. Preload it with `fetchpriority="high"` and match its crop to the first video frame so the swap is invisible.
5. **Fonts:** one variable font file, self-hosted through `next/font`, `display: swap`, preloaded.
6. **Images:** explicit `width` and `height` or `aspect-ratio` on every frame so nothing shifts. Lazy-load everything below the hero. Quality 70 to 75 for AVIF.
7. **Code-split by section:** dynamic-import the carousel, the globe and the search overlay. The menu can ship in the main bundle because it is small.
8. **Animation cleanup:** create GSAP animations inside `gsap.context()` (or the `useGSAP` hook) and revert on unmount. Kill ScrollTriggers on route change. One shared `IntersectionObserver` per behaviour, not one per element.
9. **Reduced motion:** under `prefers-reduced-motion: reduce`, disable Lenis, all scrubbed effects, the marquee and count-up (show final numbers), and replace videos with their posters plus a play button. Hover colour changes stay.
10. **Mobile simplification:** no Lenis, no pinning, no parallax, no scrubbed scale. Keep one-shot reveals (fade and 24 px rise) and count-up.
11. **Elevated tier budget:** at most one pinned section and three scrubbed effects on the page. Scrubbed effects use `scrub: 0.5` to 1 and animate one element each.

### Targets

| Metric | Target on a mid-range phone, 4G |
| --- | --- |
| LCP | Under 2.5 s (poster image) |
| CLS | Under 0.05 |
| INP | Under 200 ms |
| JavaScript on first load | Under 180 kB gzipped, including GSAP core and ScrollTrigger |
| Total transfer before interaction | Under 2.5 MB including the mobile hero video |

## 14. Design blueprint

This is the build brief. Hand sections 14 to 18 plus the client's content to the builder; sections 0 to 13 are the evidence behind it.

### A. Design philosophy

- **Media brand, not brochure.** Film leads; the page opens on people and motion, and returns to film twice more.
- **One typeface, one accent colour, two shapes.** A heavy geometric sans, a single deep brand colour, pills and circles for every control, 8 px radius for every image.
- **Bold through weight, not size.** Headings top out at 68 px but are weight 800 with tight tracking.
- **Photo-first listings.** No card chrome. Price, address, specs in three quiet lines.
- **Interactions reward the pointer.** Hovering changes the layout (cards widen, panels open, backdrops appear). Scrolling is left alone.
- **Fast and direct.** 0.3 to 0.6 s, ease-out, no bounce, no delay chains longer than 0.4 s.
- **Continuity through tone.** Blocks touch and alternate film, light, black and brand colour; a rounded sheet rises over every dark opener.

### B. Colour structure

Roles matter more than values. Swap `--brand` family for the new client; keep the neutrals.

```css
:root {
  /* Brand (reference values shown; replace per client) */
  --brand:            #001a72;  /* headings on light, primary buttons, scrolled header */
  --brand-deep:       #131176;  /* contact block background */
  --brand-hover:      #002fcf;
  --brand-active:     #0028af;
  --brand-focus:      #00218f;
  --brand-tint:       #eff3ff;  /* disabled, subtle fills */
  --brand-header:     rgb(0 26 114 / .85);

  /* Neutrals */
  --white:            #ffffff;
  --paper:            #f7f7f7;  /* off-white blocks, open service card */
  --line:             #eaeaea;  /* hairlines */
  --ink:              #000000;  /* black blocks, prices */
  --ink-soft:         #131826;
  --text:             #484848;  /* body on light */
  --text-muted:       #787878;  /* kickers */
  --placeholder:      #aaaaaa;

  /* Alpha strokes and overlays */
  --stroke-on-light:  rgb(0 0 0 / .16);
  --stroke-on-dark:   rgb(255 255 255 / .24);
  --overlay-hero:     rgb(0 0 0 / .30);
  --overlay-band:     rgb(0 0 0 / .10);
  --shadow-chip:      0 4px 8px rgb(0 0 0 / .02);
}
```

Usage split on the homepage: roughly 50% white and off-white, 16% film, 18% black, 15% brand colour. The brand colour is never used for body text and never as a thin accent line; it appears as solid fields, headings and buttons.

### C. Typography system

Use the scale in section 7. As tokens:

```css
:root {
  --font-sans: "[BRAND FONT]", "Montserrat", system-ui, sans-serif;
  --h1: 800 clamp(2.25rem, 1rem + 4.2vw, 4.25rem)/1.12 var(--font-sans);
  --h2: 800 clamp(1.5rem, .9rem + 2.6vw, 3rem)/1.24 var(--font-sans);
  --h3: 800 clamp(1.31rem, 1rem + 1vw, 2rem)/1.14 var(--font-sans);
  --h4: 800 clamp(1.125rem, 1rem + .5vw, 1.5rem)/1.31 var(--font-sans);
  --h5: 800 clamp(1rem, .95rem + .3vw, 1.25rem)/1.325 var(--font-sans);
  --body: 500 1rem/1.5 var(--font-sans);
  --small: 500 .875rem/1.43 var(--font-sans);
  --label: 700 .875rem/1.2 var(--font-sans);   /* uppercase, .02em */
  --tag: 700 .75rem/1.33 var(--font-sans);     /* uppercase */
  --track-h1: -0.022em;  --track-h2: -0.015em;  --track-h3: -0.005em;
}
```

Heading blocks: `max-width: 42rem`. Paragraphs: `max-width: 37.5rem`. Left-aligned except hero and sub-brand band.

### D. Spacing system

| Token | Desktop | 1024 px and below | 560 px and below |
| --- | --- | --- | --- |
| `--gutter` (page side padding) | 80 px (5.56vw above 1440) | 24 px | 20 px |
| `--block-lg` (major block padding) | 112 px | 80 px | 56 px |
| `--block-md` | 96 px | 64 px | 56 px |
| `--block-sm` | 64 px | 48 px | 40 px |
| `--gap-grid` (light cards) | 48 px | 32 px | 32 px |
| `--gap-wall` (immersive cards) | 20 px | 20 px | 20 px |
| `--gap-strip` (carousel cards) | 18 px | 18 px | 12 px |
| `--gap-chip` | 8 px | 8 px | 8 px |
| `--stack-head` (header group to component) | 40 px | 32 px | 24 px |
| `--radius-pill` | 100 px |  |  |
| `--radius-search` | 500 px |  |  |
| `--radius-sheet` | 48 px | 48 px | 32 px |
| `--radius-panel` (menu) | 36 px |  | 24 px |
| `--radius-media` | 8 px |  |  |
| `--radius-tag` | 4 px |  |  |
| Control heights | 56 px (pill, circle arrow), 40 px (icon circle), 48 px (chip), 88 px (hero search) |  | 40 px, 40 px, 48 px, 64 px |

Container widths: content 1352 px at 1512; narrow two-column blocks 1180 px; promo block 1032 px.

### E. Header system

Build exactly as section 1. Three variants by prop: `transparent` (default over film), `solid` (scrolled), `light` (white pill for pages that open on a gallery). Fixed, 16 px inset, 100 px radius, 106 px tall at desktop, 72 px from 1024 to 1200, 58 px at tablet, pill with two icon circles on mobile. Never hides. Elevated: 12 px backdrop blur and a 0.3 s background fade.

### F. Mobile menu

One `MenuPanel` component serves both breakpoints: white, rounded, inset 16 px, internal scroll, body scroll locked, focus trapped, closes on Escape and on backdrop click. Desktop composition and mobile order are in section 1. Entrance from the right; Elevated timing in section 16, Animation 20.

### G. Hero system

`Hero` takes `variant: "search" | "title"`, `[HERO VIDEO]`, poster, `[HEADLINE]`, `[DESCRIPTION]`, `objectPosition` and `height` (default 80vh, minimum 560 px, mobile 540 px). Flat 30% overlay plus bottom-to-black gradient. `search` variant centres the headline and the 735 × 88 px search pill. `title` variant places the headline bottom-left with a pill button and a mute toggle bottom-right. The block that follows any hero must be a `Sheet` (rounded top).

### H. Section-by-section homepage structure

Use the wireframe in section 15 and the measurements in section 3. Each block is a `Section` wrapper with props `tone: "paper" | "white" | "black" | "brand" | "film"`, `padding: "lg" | "md" | "sm"`, `sheet: boolean`, plus a `SectionHeader` (kicker, h2, description, max-width) and an optional `SectionFooter` (arrows left, pill right).

### I. Property card system

Three components sharing one data shape (`image, price, address, specs[], status, collection, href`): `PropertyCardLight`, `PropertyCardImmersive`, `AccordionCard`. Specifications in section 5. Shared rules: 8 px radius, `object-fit: cover`, whole card is a link, hover zoom only on fine pointers, corner-tab labels, uppercase dotted specs, no icons.

### J. CTA system

- One primary action per block, as a solid pill, placed bottom-left under grids or bottom-right under carousels.
- On film, black and brand backgrounds the primary pill is white with brand-colour text.
- Secondary actions are outline or tonal pills beside the primary, never below it.
- The closing CTA of the page is the contact block: headline left on a brand-mark watermark, form card right.
- Every listing-facing page ends with the same contact block and footer newsletter band.
- Phone number is a first-class CTA: in the header row, in the menu top row and at the top of the mobile menu.

### K. Animation system

Three layers, each with one owner (details in sections 16 and 18):

1. **State transitions (CSS):** hovers, chips, cards, accordion, service cards, header state, marquee. 0.3 s `ease-out` default; 0.5 to 0.6 s for size changes and backdrops.
2. **Entrances (GSAP + ScrollTrigger, once):** section headers, card grids, stats and count-up. 0.8 to 1 s, `power3.out`, 0.08 to 0.1 s stagger, start at `top 80%`.
3. **Scrubbed scenes (GSAP + ScrollTrigger, Elevated only):** hero parallax, band scale, tone crossfade, one pinned band.

Tokens: `--ease-out: cubic-bezier(.22,.61,.36,1)`, `--ease-inout: cubic-bezier(.65,0,.35,1)`, `--dur-1: .3s`, `--dur-2: .5s`, `--dur-3: .8s`.

### L. Transition system

The five devices in section 10 are mandatory: rounded sheet after every dark opener, film bands as chapter titles, alternating tone, one edge-bleeding element every second block, and the four repeated motifs (pill, circle, corner tab, brand mark). Page-to-page transitions: none on the reference; Elevated option is a 0.4 s brand-colour wipe using the View Transitions API.

### M. Footer system

Section 11. Four bands: newsletter (paper), sitemap (white, driven by the same navigation config as the menu), brand row with social circles, legal. Elevated: giant wordmark at 8% opacity as the final element.

### N. Responsive rules

Breakpoints: 560, 768, 1024, 1200, 1980. Rules and per-width values in section 12. In short: nav collapses under 1200; grids go 3 → 2 → 1; wide components become swipe rows; hover behaviours are removed on touch; type is fluid between 560 and 1280 rather than stepping once.

### O. Performance rules

Section 13, rules 1 to 11, are acceptance criteria. The short form: transform and opacity only, one video on load, posters as LCP, AVIF with correct `sizes`, sections code-split, every animation created in a reversible context, full reduced-motion path, no scrubbed effects on mobile.

## 15. Homepage wireframe

Sixteen blocks in the reference's own order, with brand-specific blocks generalised for another agency. Blocks marked optional can be dropped without breaking the tonal rhythm, provided two light blocks never end up adjacent without a tone change.

| # | Block | Tone | Height (desktop) | Component | Content slots |
| --- | --- | --- | --- | --- | --- |
| 01 | Navigation | Transparent → brand pill | 106 px, fixed | `Header` | `[LOGO]`, 5 links, `[PHONE]`, search pill, `[CTA]`, account, Menu |
| 02 | Hero | Film | 80vh | `Hero` (search) | `[HERO VIDEO]`, `[HEADLINE]`, `[DESCRIPTION]`, search placeholder |
| 03 | Property discovery by area | Paper, rounded sheet | About 450 px | `AreaChipGrid` | `[HEADLINE]`, 8 to 20 `[AREA NAME]` chips, one `[LOCATION IMAGE]` each, optional sub-areas |
| 04 | Featured properties | White | About 1,850 px | `PropertyGrid` of `PropertyCardLight` | `[HEADLINE]`, `[DESCRIPTION]`, 6 or 9 listings, `[CTA]` |
| 05 | Media feature (optional) | Black | About 890 px | `FeatureBanner` | `[FEATURE IMAGE]`, kicker, `[HEADLINE]`, partner line, circular action |
| 06 | Premium collection intro | Film | 600 px | `VideoBand` (centred) | `[BAND VIDEO]`, `[COLLECTION LOCKUP]`, `[DESCRIPTION]`, `[BRAND MARK]` watermark |
| 07 | Premium listings | Black | About 1,330 px | `PropertyGrid` of `PropertyCardImmersive` | 6 listings, `[CTA]` |
| 08 | Projects or neighbourhoods | White | About 1,180 px | `AccordionCarousel` | `[HEADLINE]`, `[DESCRIPTION]`, 8 to 24 `[DEVELOPMENT IMAGE]` cards, arrows, `[CTA]` |
| 09 | Services | Film | 700 px | `VideoBand` + `ServicePanel` × 3 | `[BAND VIDEO]`, `[HEADLINE]`, 3 × (label, title, `[DESCRIPTION]`, `[CTA]`), mute toggle |
| 10 | Statistics and reach | White | About 1,040 px | `StatsBlock` + `Globe` or `[MAP GRAPHIC]` | kicker, `[HEADLINE]`, `[DESCRIPTION]`, 4 stats, `[CTA]` |
| 11 | Product or app promo (optional) | Brand gradient | About 800 px | `PromoSplit` | `[DEVICE MOCKUPS]`, `[PRODUCT LOGO]`, `[HEADLINE]`, `[DESCRIPTION]`, `[CTA]` |
| 12 | Agents / join the team | Paper | About 870 px | `MaskedImageSplit` | `[LIFESTYLE IMAGE]` in `[BRAND MARK]`, kicker, `[HEADLINE]`, `[DESCRIPTION]`, 2 CTAs |
| 13 | Press logos | Paper | About 270 px | `LogoMarquee` | label, 6 to 12 `[PRESS LOGO]` |
| 14 | Testimonials or press quotes | Paper | About 770 px | `QuoteSlider` | `[HEADLINE]`, `[DESCRIPTION]`, 6+ × (source, quote, link), arrows, `[CTA]` |
| 15 | Selling / appraisal CTA | Deep brand | About 1,000 px | `ContactBlock` | `[HEADLINE]`, `[BRAND MARK]` watermark, form (name, email, phone, topic, message, consent) |
| 16 | Footer | Paper then white | 800 to 1,200 px | `Footer` | newsletter headline, sitemap from nav config, socials, legal |

### Mapping to a typical agency brief

| Your example slot | Wireframe block |
| --- | --- |
| Navigation | 01 |
| Hero | 02 |
| Search / property discovery | 02 (search pill) and 03 |
| Brand introduction | 06 (film band) or 05 |
| Featured properties | 04 and 07 |
| Markets / locations | 03 and 08 |
| Services | 09 |
| Brand statement | 06 |
| Statistics / achievements | 10 |
| Agents / team | 12. For a team roster, add an `AgentCarousel` of `[AGENT IMAGE]` cards (3:4, name and role below) after block 12 |
| Testimonials / press | 13 and 14 |
| Selling / appraisal CTA | 15 |
| Footer | 16 |

### Tonal sequence to preserve

Film → paper (sheet) → white → black → film → black → white → film → white → brand gradient → paper → paper → paper → deep brand → paper → white.

## 16. Animation specification

Twenty animations: eleven Faithful (they exist on the reference and define its character) and nine Elevated (optional). Build all Faithful ones; they are mostly CSS. Shared defaults: ease `power3.out` in GSAP or `cubic-bezier(.22,.61,.36,1)` in CSS; reveal distance 40 px desktop and 24 px mobile; entrance trigger at `top 80%`, `once: true`.

### Faithful

**ANIMATION 01 — Header state change**

- **Trigger:** `scrollY` passes 0 (use a 1 px sentinel at the top of `<main>` with `IntersectionObserver`).
- **Elements:** header pill background, link colours, CTA colours.
- **Sequence:** 1. Background transparent → `--brand-header`. 2. On `light` variant pages, white → `--brand-header` and text brand colour → white.
- **Duration / easing:** 0.2 s, `ease-in-out`. Reverses when back at top.
- **Owner:** CSS class toggle.

**ANIMATION 02 — Area chip hover and backdrop reveal**

- **Trigger:** pointer enters a chip (fine pointers only); also keyboard focus.
- **Elements:** chip, matching `[LOCATION IMAGE]` in the backdrop panel.
- **Sequence:** 1. Chip background white → brand colour, text brand colour → white (0.3 s). 2. Backdrop image opacity 0 → 1 (0.6 s). 3. On leave, both reverse; a newly hovered chip's image fades in over the outgoing one.
- **Easing:** `ease-out`.
- **Owner:** CSS, with React state for the active index. Images load on first hover intent.

**ANIMATION 03 — Area sub-list**

- **Trigger:** click or Enter on a chevron chip.
- **Sequence:** 1. Chevron rotates 0 → 90°. 2. List opacity 0 → 1 and `visibility` on (0.3 s). 3. Chip holds its inverted colours while open. 4. Click outside or Escape closes.
- **Owner:** CSS + state.

**ANIMATION 04 — Light card hover**

- **Trigger:** pointer enters the card (fine pointers only).
- **Sequence:** image `scale(1)` → `scale(1.1)` inside its clipped 8 px-radius frame. Text does not move.
- **Duration / easing:** 0.3 s, `ease-out`.
- **Owner:** CSS.

**ANIMATION 05 — Immersive card hover**

- **Trigger:** pointer enters the card.
- **Sequence:** 1. Image `scale(1)` → `scale(1.07)`. 2. A black overlay goes 0 → 25% opacity. Text and tag stay fixed.
- **Duration / easing:** 0.3 s, `ease-out`.
- **Owner:** CSS.

**ANIMATION 06 — Accordion carousel expand**

- **Trigger:** pointer enters a slide (fine pointers, 1025 px and up).
- **Elements:** slide frame, title, description, neighbouring slides.
- **Sequence:** 1. Slide `width` 242 → 600 px and `height` 480 → 540 px (0.5 s). 2. Title `font-size` 24 → 48 px (0.6 s). 3. Description opacity 0 → 1 (0.5 s). 4. Neighbours are pushed along the row by layout. 5. On leave, all reverse at the same durations.
- **Easing:** `ease`.
- **Scroll relation:** none.
- **Owner:** CSS transitions on slides inside a Swiper or Embla track with auto slide widths. Disable the carousel's own translate recalculation during hover.
- **Touch:** no expansion; cards are 156 × 217 px in a free-scroll row.

**ANIMATION 07 — Service panel expand**

- **Trigger:** pointer enters a panel; on touch, tap. One panel open at a time; first panel open by default on touch.
- **Sequence:** 1. Background transparent → `--paper`; text white → `--text` (0.3 s). 2. Hidden region opens from 0 to its content height, growing upward (0.3 s). 3. Paragraph and CTA are simply uncovered, no separate fade.
- **Easing:** `ease-in-out`.
- **Owner:** CSS, `grid-template-rows: 0fr → 1fr`.

**ANIMATION 08 — Stats entrance and count-up**

- **Trigger:** stat grid top reaches 80% of the viewport. Once.
- **Elements:** four values, four labels.
- **Sequence:** 1. Each value rises from `yPercent: 100`, opacity 0 → 1 (1 s), staggered 0.1 s. 2. In parallel each value counts from 0 to its target, keeping any suffix such as K, M or + (2 s, `power1.out`, integers only). 3. Labels fade 0 → 1 (1 s) with the same stagger.
- **Owner:** GSAP + ScrollTrigger.
- **Reduced motion:** show final values immediately.

**ANIMATION 09 — Logo marquee**

- **Trigger:** always running while in view.
- **Sequence:** track of logos, duplicated once, translates `x: 0 → -50%` and loops.
- **Duration / easing:** 40 to 60 s per loop, linear. No pause on hover.
- **Owner:** CSS keyframes; `animation-play-state: paused` when off-screen or reduced motion.

**ANIMATION 10 — Carousel step and drag**

- **Trigger:** arrow click, mouse drag, touch swipe.
- **Sequence:** track translates by one slide. Accordion carousel: 0.3 s, loops infinitely, centred. Quote slider: 0.5 s, finite, arrows disable at the ends, 3 / 2 / 1.4 slides visible at desktop / 1200 px / 768 px.
- **Owner:** Swiper or Embla.

**ANIMATION 11 — Buttons and links**

- **Trigger:** hover, focus-visible, active.
- **Sequence:** background `--brand` → `--brand-hover` → `--brand-active`; outline borders strengthen; text links shift colour.
- **Duration / easing:** 0.3 s, `ease-out`.
- **Owner:** CSS.

### Elevated

**ANIMATION 12 — Hero entrance**

- **Trigger:** page load, after the poster has decoded.
- **Elements:** hero media, overlay, headline lines, subline, search pill, header.
- **Sequence:** 1. Media scales 1.08 → 1 (1.6 s). 2. Overlay opacity 0.6 → 0.3 (1.2 s, same start). 3. At 0.2 s, headline lines rise from clipped rows, `yPercent: 110 → 0`, 0.09 s stagger (0.9 s each). 4. At 0.5 s, subline fades and rises 16 px (0.6 s). 5. At 0.65 s, search pill fades and rises 24 px, scaling 0.98 → 1 (0.7 s). 6. At 0.3 s, header pill fades in and drops 12 px (0.6 s).
- **Total:** about 1.6 s. **Easing:** `power3.out`; media uses `power2.out`.
- **Owner:** one GSAP timeline. Runs once per session; later visits get a 0.4 s fade only.

**ANIMATION 13 — Section heading line reveal**

- **Trigger:** heading enters at `top 80%`. Once.
- **Initial state:** heading split into lines, each line wrapped in an `overflow: hidden` row and offset `yPercent: 105`.
- **Sequence:** 1. Kicker fades in (0.4 s). 2. Lines rise to 0 with 0.08 s stagger (0.8 s each). 3. Description fades and rises 16 px, starting 0.15 s after the last line (0.6 s).
- **Easing:** `power3.out`.
- **Owner:** GSAP + ScrollTrigger with SplitText (lines) or a small manual line splitter. Re-split on resize.
- **Mobile:** same, with 0.6 s lines.

**ANIMATION 14 — Sheet lift with hero parallax**

- **Trigger / scroll relation:** scrubbed from hero top at viewport top to hero bottom at viewport top.
- **Sequence:** 1. Hero media `yPercent: 0 → 12`. 2. Hero content `yPercent: 0 → -20` and opacity 1 → 0 over the first 60%. 3. The following `Sheet` has `margin-top: -48px` and a higher `z-index`, so it visibly slides over the film.
- **Owner:** GSAP + ScrollTrigger, `scrub: 0.6`. Desktop only.

**ANIMATION 15 — Card grid entrance**

- **Trigger:** each row of cards reaches `top 85%`. Once.
- **Sequence:** cards in the row fade 0 → 1 and rise 40 px, staggered 0.08 s left to right (0.8 s each). The image inside each card also scales 1.08 → 1 (1.2 s).
- **Owner:** GSAP ScrollTrigger `batch()`.

**ANIMATION 16 — Video band settle**

- **Trigger / scroll relation:** scrubbed while the band travels from entering the viewport to its centre.
- **Sequence:** media `scale: 1.12 → 1`; overlay 0.5 → its resting value. Band content (lockup or heading) uses Animation 13.
- **Owner:** GSAP + ScrollTrigger, `scrub: 0.8`. The video starts playing when the band is 50% of a viewport away and pauses when it leaves.

**ANIMATION 17 — Tone crossfade into the dark grid**

- **Trigger / scroll relation:** scrubbed across the last 30vh of the white block before the premium band.
- **Sequence:** the page wrapper's background interpolates white → black; text in the outgoing block's footer row fades to 0.
- **Owner:** GSAP + ScrollTrigger on a CSS variable. One location only.

**ANIMATION 18 — Pinned services sequence**

- **Trigger / scroll relation:** the services band pins when its top reaches the viewport top, for 150vh of scroll.
- **Sequence:** 1. 0 to 33%: panel 1 open. 2. 33 to 66%: panel 1 closes, panel 2 opens. 3. 66 to 100%: panel 3 opens. Each change is a 0.4 s tween fired at the threshold, not scrubbed. Hover still overrides.
- **Owner:** GSAP + ScrollTrigger `pin: true`. Desktop 1025 px and up only; no pin on touch.

**ANIMATION 19 — Masked image reveal**

- **Trigger:** media banner or split image reaches `top 75%`. Once.
- **Sequence:** 1. Frame `clip-path: inset(100% 0 0 0) → inset(0)` (1.1 s, `power4.inOut`). 2. Image inside scales 1.2 → 1 (1.4 s, `power3.out`).
- **Owner:** GSAP + ScrollTrigger.

**ANIMATION 20 — Menu and search overlays**

- **Trigger:** Menu button, search pill, hero search bar; Escape, close button or backdrop to close.
- **Faithful:** panel appears from the right with no visible easing; search overlay appears in place.
- **Elevated sequence (menu):** 1. Backdrop tint opacity 0 → 1 (0.3 s). 2. Panel `xPercent: 100 → 0` (0.6 s, `power3.out`). 3. Primary links rise from clipped rows, 0.05 s stagger (0.5 s each), starting at 0.25 s. 4. Right-column groups fade and rise 16 px, 0.06 s stagger. 5. Close: all content fades (0.15 s), panel `xPercent → 100` (0.35 s, `power2.in`).
- **Elevated sequence (search):** overlay fades and rises 24 px (0.35 s); input autofocuses; the three discovery columns fade in with 0.06 s stagger.
- **Owner:** Motion (`AnimatePresence`) or one GSAP timeline per overlay. Pick one and use it for both.

### Global motion rules

- Smooth scroll (Elevated): Lenis, `lerp: 0.1`, desktop fine pointers only, synced to ScrollTrigger through `lenis.on('scroll', ScrollTrigger.update)`.
- No animation delays a user action. Nothing blocks scroll for longer than the 150vh pin.
- Under reduced motion, all Elevated animations and Animations 08 and 09 are replaced by their end states.

## 17. Component inventory

Forty-four reusable components rebuild the homepage and overlays, and ten more cover the property page. Primitives first, then layout, then feature blocks.

### Primitives

| Component | Variants / key props | Notes |
| --- | --- | --- |
| `Button` | `solid`, `inverse`, `outline`, `tonal`; `size: lg (56) / sm (40)`; `icon` | Pill. 0.3 s colour transition |
| `ArrowButton` | `size: 40 / 56 / 96`; `direction`; `tone: light / dark` | Circle, 1 px outline |
| `IconButton` | `size: 40`; `solid` or `outline` | Account, close, mute, search |
| `TextLink` | `chevron` | 14 px / 700 |
| `Chip` | `active`, `hasChildren` | 48 px tall, 8 px radius, inverts on hover |
| `Tag` | `chip` (4 px radius) or `tab` (flush corner) ; `corner: tl / bl` | Status and collection labels |
| `Kicker` | `tone` | 12 to 14 px uppercase label |
| `AnimatedHeading` | `as: h1–h4`, `reveal: none / lines` | Static by default; line reveal is Elevated |
| `SpecRow` | `items[]`, `separator: bullet / middot`, `layout: inline / columns` | Uppercase dotted specs |
| `Field` | `input`, `select`, `textarea`, `checkbox` | 56 px tall, 8 px radius |
| `MediaFrame` | `ratio`, `radius`, `hoverZoom`, `gradient` | Wraps `next/image`; clips zoom |
| `BackgroundVideo` | `src[]`, `poster`, `objectPosition`, `overlay`, `lazy`, `muteToggle` | Pauses off-screen; poster fallback under reduced motion |
| `BrandMarkMask` | `image`, `opacity`, `bleed: left / bottom` | Photo clipped to `[BRAND MARK]` via SVG mask |

### Layout and navigation

| Component | Key props | Notes |
| --- | --- | --- |
| `Header` | `variant: transparent / solid / light` | Floating pill; scroll sentinel |
| `NavDropdown` | `items[]` | Small white card under a link |
| `MenuPanel` | `nav config` | Desktop three-zone layout; mobile single column; focus trap |
| `SearchOverlay` | `featured`, `developments[]`, `listings[]` | Full-screen, three discovery columns |
| `Section` | `tone`, `padding`, `sheet` | Handles background, padding, rounded top |
| `SectionHeader` | `kicker`, `title`, `description`, `align`, `maxWidth` |  |
| `SectionFooter` | `arrows`, `cta` | Arrows left, pill right |
| `Container` | `width: full / default / narrow / promo` | Gutters from tokens |
| `Footer` | `nav config`, `legal` | Four bands |
| `NewsletterBand` | `headline`, `consent` | Email field with inset circular submit |

### Feature blocks

| Component | Used in block | Notes |
| --- | --- | --- |
| `Hero` | 02 | `search` and `title` variants |
| `HeroSearch` | 02 | 88 px pill that opens `SearchOverlay` |
| `AreaChipGrid` | 03 | Chips, hover backdrop panel, sub-area lists |
| `PropertyCardLight` | 04 | Text below image |
| `PropertyCardImmersive` | 07 | Text on image |
| `PropertyGrid` | 04, 07 | `columns: 3 / 2 / 1`, `gap` token |
| `FeatureBanner` | 05 | Contained image, caption left, circular action right |
| `VideoBand` | 06, 09 | `align: center / top-left`, optional watermark |
| `AccordionCarousel` + `AccordionCard` | 08 | Hover-expand filmstrip |
| `ServicePanel` | 09 | Glass card that opens upward |
| `StatsBlock` + `StatCounter` | 10 | 2 × 2 grid, count-up |
| `Globe` | 10 | Lazy canvas; static image fallback. Replace with `[MAP GRAPHIC]` for a single-city brand |
| `PromoSplit` | 11 | Gradient, mockups left, copy right |
| `MaskedImageSplit` | 12 | `BrandMarkMask` left, copy right |
| `LogoMarquee` | 13 | CSS loop |
| `QuoteSlider` + `QuoteCard` | 14 | Text-only cards with top rule |
| `ContactBlock` + `ContactForm` | 15 | Watermark headline left, form card right |

### Property page additions

`GalleryMosaic` (1 + 4 with lightbox), `PropertySummary` (title, price, `SpecRow`, share), `AnchorSubnav`, `DefinitionTable`, `FeatureList`, `StickyEnquiryCard` (date picker, time select, segmented toggle), `AgentCard` (`[AGENT IMAGE]`, name, role, phone, email), `MapBlock`, `FullBleedImage`, `PropertySlider`.

### Not needed

No scroll-progress bar, custom cursor, preloader or page-transition layer exists on the reference. Add none of them in the Faithful tier.

## 18. Technical recommendation

Build on Next.js with Tailwind, let CSS own every hover and state change, and give GSAP with ScrollTrigger the few scroll-triggered pieces. That is two animation tools for the Faithful tier; Lenis and Motion are optional and each has exactly one job.

### Stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Framework | Next.js (App Router), React, TypeScript | Server-rendered listing pages, image optimisation, route-level code splitting |
| Styling | Tailwind CSS with the tokens from section 14 as CSS variables in the theme | Pills, radii and spacing become utilities; tones switch by data attribute |
| Images | `next/image`, AVIF and WebP | Responsive `sizes` per grid |
| Fonts | `next/font`, one variable family | Self-hosted, preloaded |
| Content | Headless CMS (Sanity fits this stack) for pages and navigation; listings from the agency's CRM or listing feed | One nav config drives header, menu and footer |
| Forms | Server Actions with schema validation; spam protection |  |
| Hosting | Vercel or equivalent edge CDN; video on a media CDN or storage bucket with range requests |  |

### Which library controls which interaction

| Interaction | Owner | Tier |
| --- | --- | --- |
| Button, chip, link, card hover; header state; area backdrop fade; sub-lists | CSS transitions | Faithful |
| Accordion card expand; service panel expand | CSS transitions | Faithful |
| Logo marquee | CSS keyframes | Faithful |
| Header scroll state; lazy video play and pause; lazy image and backdrop loading | `IntersectionObserver` (no library) | Faithful |
| Accordion carousel track, quote slider, property slider, gallery lightbox | Swiper (or Embla if bundle size matters more than built-in features) | Faithful |
| Stats entrance and count-up | GSAP + ScrollTrigger | Faithful |
| Section heading reveals, card grid entrances, masked image reveals | GSAP + ScrollTrigger (SplitText for lines) | Elevated |
| Hero entrance timeline | GSAP timeline | Elevated |
| Hero parallax, band settle, tone crossfade, pinned services | GSAP + ScrollTrigger, scrubbed | Elevated |
| Smooth scrolling | Lenis, desktop only, wired to ScrollTrigger | Elevated |
| Menu and search overlay mount, unmount and exit animation | Motion `AnimatePresence`, or GSAP if you prefer one library | Faithful needs only CSS; Elevated benefits from exit animation |
| Globe | Small canvas or WebGL globe, dynamically imported | Faithful (optional block) |

### Rules to avoid library overlap

- One owner per element. If GSAP animates an element's `transform`, CSS transitions on `transform` are removed from it.
- Motion is used for overlay presence only. If the team is comfortable writing GSAP exit timelines, drop Motion entirely.
- Swiper handles track movement only; card hover states stay in CSS.
- Lenis is added last, after everything works on native scroll, and is disabled for touch and reduced motion.
- GSAP code lives in client components behind `useGSAP`, scoped to a ref, and is not imported by server components.

### Suggested structure

```text
app/
  (site)/page.tsx                 homepage: ordered list of blocks
  (site)/properties/[slug]/page.tsx
  (site)/layout.tsx               Header, MenuPanel, SearchOverlay, Footer
components/
  primitives/   Button, ArrowButton, Chip, Tag, MediaFrame, BackgroundVideo ...
  layout/       Header, MenuPanel, Section, SectionHeader, Footer ...
  blocks/       Hero, AreaChipGrid, PropertyGrid, AccordionCarousel, VideoBand ...
  motion/       useReveal, useCountUp, useScrollScene, LenisProvider
lib/
  nav.ts        single navigation config
  tokens.css    colour, type, spacing, motion variables
```

### Build order

1. Tokens, primitives, `Section`, `Header`, `Footer` on static content.
2. Hero, sheet hand-off, both property cards and grids.
3. `AccordionCarousel`, `ServicePanel`, `AreaChipGrid` (the three signature interactions).
4. Menu and search overlays; contact block; remaining blocks.
5. Faithful motion: stats, marquee, lazy video.
6. Responsive pass at 390, 820, 1100, 1280 and 1920 px; reduced-motion pass.
7. Elevated motion, one animation at a time, measuring INP and frame rate after each.

### Handing this to a builder

Give the builder sections 14 to 18, the client's logo, brand mark as SVG, brand colour, font choice, `[HERO VIDEO]` and two band videos (or stills to stand in), listing data, area list, three services, four stats, press or testimonial items, and the navigation tree. State which tier you want: Faithful only, or Faithful plus a named list of Elevated animations by number.
