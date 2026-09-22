# Bott Monument Project Plan

Current state: **2026-09-22**. This is the principal project file: what is
done, how the homepage is modeled and rendered, and what is still open.
Run commands stay in the READMEs. Copying a database stays in
[LOCAL_SQLITE_HANDOFF.md](docs/LOCAL_SQLITE_HANDOFF.md). Production stays in
[DEPLOYMENT.md](docs/DEPLOYMENT.md). Completed historical approaches are not
instructions for the current code.

## Source of truth and stack

- Visual reference: `bott-monument-design/index.html` and its local assets.
- Content: Strapi **Page → Home**, slug `home`, plus the collections below.
- Frontend: Next.js 16, React 19, TypeScript, Tailwind 4; server-side GraphQL reads.
- CMS: Strapi 5.53, GraphQL. Local development uses SQLite unless `DATABASE_CLIENT=postgres`.
- Runtime: Node 22 (matching CI), npm lockfiles per app; no npm workspaces.
- Formatting: root Biome; frontend lint: ESLint.
- Fonts: Cormorant Garamond, Montserrat, Alex Brush through `next/font`.
- Every public language uses `/{locale}` and `/{locale}/news`, including English
  at `/en`. `/` and `/news` detect the browser language and redirect to a published
  Home localization, falling back to English. Hosting has not been selected.

## Design to product map

| Section | CMS source | DOM ID | Next component | Item collection |
| --- | --- | --- | --- | --- |
| Header/menu | `Page.header` — fixed | `#navbar` | `Header` | — |
| Hero | `Page.hero` — fixed | `#hero` | `Hero` | — |
| Marquee | `content: pages.marquee` | `#marqueeStrip` | `MarqueeStrip` | — |
| Founder | `content: pages.founder` | `#founder` | `Founder` | — |
| News / Featured Stories | `content: pages.news` | `#work` | `News` | Press Item |
| As Featured In | `content: pages.featured-in` | `#press-clippings` | `FeaturedIn` | Features |
| Gallery | `content: pages.gallery` | `#gallery` | `Gallery` | Gallery |
| Showroom / About | `content: pages.showroom` | `#showroom` | `Showroom` | — |
| Testimonials | `content: pages.testimonials` | `#testimonials` | `Testimonials` | Comments |
| Contact | `content: pages.contact` | `#contact` | `Contact` | Inquiries stores submissions |
| Footer | `Page.footer` — fixed | `#footer` | `Footer` | — |

Default navigation: Masterpieces → `#work`, Gallery → `#gallery`, Inquire →
`#contact`, About → `#showroom`. Header links are editable in Page. The original
HTML uses `#founder` for the showroom; keep the implemented IDs above.

## How the homepage is rendered

`Page.header`, `Page.hero`, `Page.content` and `Page.footer`, plus the item
collections and Site Settings, load through `getPage` in
`apps/web/src/page-builder/`. Mappers adapt that content and `RenderPage`
places Hero, then the middle blocks, then Footer.

`SectionContent` is a presentation type passed to the visual components. It is
not a CMS content type. Only the eight middle blocks can be dragged. Header
owns the logo, site name and menu. Home SEO owns the title, description and
social image, and those values are the site-wide metadata defaults. Site
Settings holds the public URL, social links and active palette. Header scroll
colors stay on the palette.

`apps/cms/src/admin/app.tsx` orders the Page fields and starts the fixed cards
and SEO collapsed. Middle blocks keep Strapi's native controls. Two Vite
aliases reuse Strapi 5.53 internal input renderers so media, relations,
validation and permissions stay intact. Recheck the admin build and those
interactions when upgrading Strapi. No dependency files are patched.

To add a section: create the `pages.*` component, add it to the Dynamic Zone
and the GraphQL fragments, then add a mapper in `page-builder/mappers.ts` and
the component in `page-builder/registry.ts`. List items belong in their own
collection, not in a JSON field. Copy layout and motion from
`bott-monument-design/index.html`. Do not add a switch in `page.tsx`. Mark the
task in this file.

## Completed

### Content model and editor

- [x] Page with stable non-localized slug, localized editorial fields, draft/publish and SEO.
- [x] Fixed Header, Hero and Footer fields, with eight middle Dynamic Zone block types.
- [x] Editor order: Header → Hero → middle sections → Footer. Fixed cards, SEO and existing middle sections start collapsed.
- [x] Only middle blocks can be dragged. Header owns logo, site name and menu links.
- [x] Preserve original copy, media and independent draft/published versions during migration.
- [x] Remove Homepage Section from CMS, GraphQL, local SQLite, legacy seeds and queries after backup and verification.
- [x] Separate Press Item, Features, Gallery and Comments collections; optional selections on Page blocks.
- [x] Empty selections use all published items in collection order; collections and selections are paginated.
- [x] Private Inquiries collection; separate create-only submission token.
- [x] Site Settings holds site URL, social links and active palette. Home → Header owns site name/logo; Home → SEO owns title, description and social image, also used as site-wide metadata defaults.

### Frontend and interactions

- [x] All sections in the map implemented using the local design.
- [x] `getPage` → mappers → `RenderPage`; Hero precedes the middle list, Footer follows main content.
- [x] Typed Page GraphQL fragments, Home SEO with safe code defaults and media URL resolution.
- [x] Preserve gallery rotation, private-gallery dialog, image lightbox, navigation and Escape handling.
- [x] Mobile menu, skip link, scroll reveals, reduced-motion handling and no-JS content visibility.
- [x] Contact validation uses published Page choices; submissions are saved to Inquiries.
- [x] Dedicated `/{locale}/news` route reads Press Item; arbitrary CMS slug routes are not implemented.
- [x] Locale-aware routing exposes every published Home localization at `/{locale}`
  and `/{locale}/news`. `/` and `/news` negotiate the browser's `Accept-Language`
  against published Home locales and redirect, with English fallback. Queries,
  collections, metadata, cache keys, document language and form validation carry locale.
- [x] Next Image optimization and configurable media origins.

### Palettes, preview and reliability

- [x] Primary/Secondary Color Palettes, extensible with additional CMS palettes.
- [x] Site Settings.activePalette controls section colors; empty fields preserve design fallbacks.
- [x] Palette synchronization on focus/visibility/pageshow and every 30 visible seconds (5 in preview), preserving interaction state.
- [x] Palette headerScroll is an ordered, repeatable list of section-specific header colors. The editor shows live palette section colors/gradients; empty lists disable overrides. Gallery uses #gallery. Existing single rules are preserved by migrate:header-rules.
- [x] Authenticated draft preview, banner and POST exit; draft data never enters public cache.
- [x] Authenticated publication webhook, CMS cache tag and 60-second public revalidation.
- [x] Complete successful reads replace cache; valid empty results clear it; errors retain last successful public data when available.
- [x] Request timeouts, invalid configuration handling and unavailable state without inventing CMS content.
- [x] Optional inquiry email notification code; email failure does not lose a saved inquiry.
- [x] Optional PostgreSQL, S3 and SMTP configuration; these services are not activated or deployment-tested.

## Verification recorded

Recorded before 2026-09-22, on the machines where those checks were run:

- 31 frontend tests and 4 CMS integration tests passed. Migration-only tests were retired with the removed migration code.
- Frontend and CMS production builds passed; frontend source lint passed with nested generated `.next` output excluded locally.
- Admin TypeScript check passed during the ordered-editor change.
- An isolated browser verified editor order, collapsed cards, opening fixed fields and no automatic unsaved changes.
- Draft and published Page reads rendered Header → Hero → middle sections → Footer.
- The author's SQLite was backed up before Homepage Section was removed. After removal, Pages, media, item collections, Site Settings, palettes, inquiries and admin accounts matched that backup.

These checks are not a cross-device or accessibility audit, and they are not a production launch test. CI checks code and builds; it does not provision services. The counts above were not rerun in the 2026-09-22 documentation pass.

## Remaining work

### Content the team can share

- [ ] Export a Page-based public snapshot and restore it into a copy of an existing SQLite database. Preserve inquiries, accounts, tokens and local configuration. Until that passes, do not import `handoff/`.
- [ ] Replace the sample phone, commission availability, copyright year and placeholder testimonials with approved copy.

### Quality

- [ ] Rerun frontend and CMS tests, typecheck and production builds on current `dev`.
- [ ] Review desktop and mobile layout, keyboard use, focus, dialogs, gallery gestures, reduced motion, long content, the contact form, preview and publishing.

### Launch

- [ ] Record keep or remove for each optional Strapi plugin in the table below. If one is removed, retest the APIs that depend on it.
- [ ] Choose hosting for the site, the CMS, the database and media.
- [ ] Provision those services, migrate with backups and verify media delivery.
- [ ] Configure the approved SMTP sender and recipient and send a real inquiry notification.
- [ ] Run the launch checks in [DEPLOYMENT.md](docs/DEPLOYMENT.md).

The snapshot and the visual review can proceed locally. Approved copy, SMTP and hosting need the corresponding content, decision or access.

## Plugin review still pending

| Plugin/provider | Current role | Decision |
| --- | --- | --- |
| GraphQL | Frontend content API | Keep |
| Upload | CMS media | Keep |
| i18n | Localized Page structure; English configured | Keep; no second public locale yet |
| Email/Nodemailer | Optional inquiry notifications | Keep code; real SMTP unverified |
| S3 provider | Optional persistent media | Prepared, not activated |
| Cloud | Strapi Cloud integration | Decide after hosting choice |
| Users & Permissions | Default Strapi user/API role support | Review dependencies before removal |
| Content Releases / Review Workflows | Strapi editorial features | Review availability and team needs; do not assume separate uninstallable packages |

Do not add SEO, redirects or translation plugins without a demonstrated requirement.

## Optional future scope — not missing MVP work

- Art Process: commented out in the design; add only if requested, using a Page block and an appropriate item collection.
- Additional languages: routing and localized content models are ready. Add or remove
  locales in Strapi Internationalization. Localize and publish Home plus its selected
  item records, then verify translated interface copy, metadata and both localized URLs.
- Additional CMS slug routes: Page can store entries, but the frontend currently consumes `home`; `/{locale}/news` remains a dedicated route.
- Demo layout pickers, headline switchers and design toolbar are excluded. CMS palettes are a real feature; demo controls are not.

## Data handoff and maintenance

Git pull updates code, not a teammate's database. Homepage Section and the old
copy commands are gone. The committed archive is still pre-Page and must not be
imported. Procedure: [LOCAL_SQLITE_HANDOFF.md](docs/LOCAL_SQLITE_HANDOFF.md).

On 2026-09-22 one local PostgreSQL database (`bott_monument`) was copied from
its pre-sync backup into a published Page `home`. That copy is not in Git and
does not replace the public snapshot. A database that still contains
`homepage_sections` needs its own backup before Strapi starts; startup drops
that table.

## Working rules and references

- Preserve the local design and existing interactions. Keep layout/motion in Next and editorial values in Strapi.
- Keep slugs, component UIDs and DOM IDs stable; localize visible copy only.
- Do not commit env files, tokens, raw SQLite databases, working uploads or local backups.
- The public archive/key are an explicit exception; exclude inquiries and user accounts, and review all included content.
- Update this checklist when work is completed. Use the app READMEs for commands.
- [Project README](README.md) · [SQLite handoff](docs/LOCAL_SQLITE_HANDOFF.md) · [Deployment](docs/DEPLOYMENT.md)
