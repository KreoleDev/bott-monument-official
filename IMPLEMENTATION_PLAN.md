# Bott Monument Project Plan

Use this file as the shared team checklist. Mark tasks with `[x]` when they are done and add initials after a task when someone owns it.

Example:

```md
- [ ] Build hero section - EG
```

## Project Shape

```text
bott-monument-official/
  apps/
    web/        Next.js frontend
    cms/        Strapi backend
  bott-monument-design/
    index.html  Original design reference
    images/     Original design images
    videos/     Original design videos
```

## Current Stack

- Strapi CMS for editable content and media.
- GraphQL API from Strapi.
- Next.js frontend for layout, design, animations, and rendering.
- Local SQLite for now (this machine may use Postgres; team handoff is still the SQLite snapshot).
- Railway likely later for Strapi hosting.
- Public site language is English only. A second locale is not shipping yet; keep the content model ready for it.

## Source Of Truth

- Published design: `https://kreoledev.github.io/bott-monument/`
- Local design file: `bott-monument-design/index.html`
- Frontend app: `apps/web`
- Backend app: `apps/cms`
- Main Strapi content type: `Homepage Section`
- Strapi schema file: `apps/cms/src/api/homepage-section/content-types/homepage-section/schema.json`
- Next Strapi client: `apps/web/src/lib/strapi.ts`
- Homepage motor: `apps/web/src/page-builder/`
- Page-builder plan (now + Strapi Dynamic Zones later): `docs/PAGE_BUILDER_PLAN.md`
- Working conventions: `README.md`

Do not ship the HTML demo toolbar, headline switchers or gallery layout pickers. Primary/Secondary colors are now real CMS settings: Color Palettes + Site Settings.activePalette. This selection changes colors globally while preserving the current layouts and interactions; it does not port the demo layout modes.

## Design To Product Map

The implemented section names, `sectionKey` values and DOM ids below are authoritative. Keep these names when matching the local design.

| Section | Implemented DOM id | `sectionKey` | Next component | Item collection in Strapi |
| --- | --- | --- | --- | --- |
| Navigation | `#navbar` | — | `Header` | — |
| Hero | `#hero` | `hero` | `Hero` | — |
| Marquee | `#marqueeStrip` | `marquee` | `MarqueeStrip` | — |
| Founder intro (Drew) | `#founder` | `founder` | `Founder` | — |
| News / Featured Stories | `#work` | `news` | `News` | `Press Item` |
| As Featured In | `#press-clippings` | `featured-in` | `FeaturedIn` | `Features` |
| Gallery | `#magazine` | `gallery` | `Gallery` | `Gallery` |
| Showroom / About | `#showroom` | `showroom` | `Showroom` | — |
| Testimonials | `#testimonials` | `testimonials` | `Testimonials` | `Comments` |
| Contact | `#contact` | `contact` | `Contact` | `Inquiries` (submissions) |
| Footer | `#footer` | `footer` | `Footer` | — |

`Homepage Section` holds section-level content. `Press Item`, `Features`, `Gallery` and `Comments` hold their individual items. `Inquiries` holds contact form submissions.

The navigation labels map to these anchors: **Masterpieces → `#work`**, **Gallery → `#magazine`**, **Inquire → `#contact`**, **About → `#showroom`**. `#work` is the News section; it does not require a separate `work` entry. `/news` lists press stories.

The original design uses `#founder` for the showroom. The implemented site uses `#founder` for Drew's introduction and `#showroom` for the showroom; retain the implemented mapping.

Process (`ART PROCESS FEATURE`) is commented out in the design. Keep it out of MVP.

## Done

- [x] Created Next.js app in `apps/web`.
- [x] Created Strapi app in `apps/cms`.
- [x] Installed Strapi GraphQL plugin.
- [x] Created `Homepage Section` content type.
- [x] Added fields for section text, colors, media, button, and order.
- [x] Created and published the `hero` entry.
- [x] Added Read Only Strapi API token to `apps/web/.env.local`.
- [x] Confirmed GraphQL returns the hero data.
- [x] Added one frontend component per section.
- [x] Connected the frontend hero to Strapi data.
- [x] Added Strapi API configuration for CORS and GraphQL limits.
- [x] Added local setup instructions and Strapi/Next conventions to `README.md`.
- [x] Keep GraphQL token server-side only (`STRAPI_URL` / `STRAPI_API_TOKEN`, no `NEXT_PUBLIC_`).

## MVP

Ship a site that matches the local design and is editable in Strapi. The requested follow-up work now includes preview and production preparation; live migration waits for destination details.

### 1. Finish Backend Content Model

- [x] Stop localizing `sectionKey`. Identifiers must stay stable across locales.
- [x] Add `Gallery` collection type (`gallery-item`).
  Fields: `title`, `subtitle`, `image`, `imagePosition`, `sortOrder`.
- [x] Add `Comments` collection type (`comment`).
  Fields: `personName`, `quote`, `location`, `sortOrder`.
- [x] Add `Press Item` collection type.
  Fields: `title`, `source`, `date`, `category`, `image`, `url`, `sortOrder`, `featured`.
- [x] Add `Features` collection type (`feature`).
  Fields: `title`, `publication`, `detail`, `image`, `featured`, `sortOrder`.
- [x] Add `Inquiries` collection type (`inquiry`) for the contact form.
  Fields: `name`, `email`, `inquiryType`, `message`, `status`.
- [x] Add `Site Settings` single type and publish the original logo/SEO defaults locally.
  Fields: `siteName`, `siteUrl`, `logo`, `socialImage`, `facebookUrl`, `instagramUrl`, `seoTitle`, `seoDescription`.
  Contact details and commission availability remain in the existing Contact component to avoid duplicate editorial sources.

### 2. Add Homepage Section Entries

Create and publish these entries in Strapi. Copy text, colors, images, and videos from the design file.

- [x] `hero`
- [x] `marquee`
- [x] `founder`
- [x] `news`
- [x] `featured-in`
- [x] `gallery`
- [x] `showroom`
- [x] `testimonials`
- [x] `contact`
- [x] `footer`

### 3. Frontend Foundation

- [x] Add local setup instructions to `README.md`.
- [x] Add shared color constants from the design.
- [x] Load design fonts with `next/font`: Cormorant Garamond, Montserrat, Alex Brush.
- [x] Cache successful public reads and retain them during outages; valid empty results replace old content.
- [x] Configure `images.remotePatterns` and optimize CMS images with Next Image.
- [x] Render homepage body sections in CMS `sortOrder`; keep header/footer in semantic positions.
- [x] Drive metadata and header logo from Site Settings.
- [x] Replace temporary section placeholders with real layouts.
- [x] Use `Founder` for Drew's introduction and `Showroom` for the About destination.
- [x] Set header anchors to `#work`, `#magazine`, `#contact`, `#showroom`.
- [x] Add mobile navigation.

### 4. Build The Sections

All main sections are implemented. Track further design refinements separately.

- [x] Header/navigation, including mobile disclosure menu
- [x] Hero and Marquee
- [x] Founder intro (`#founder`)
- [x] News / Featured Stories (`#work`, key `news`) and `/news`
- [x] As Featured In (`#press-clippings`, key `featured-in`)
- [x] Circular Gallery (`#magazine`), drag, hover, keyboard and access-request dialog
- [x] Showroom / About (`#showroom`), statistics and visit CTA
- [x] Testimonials with `Comments` collection and scrolling cards
- [x] Contact form → private Strapi `Inquiries`, validation and confirmation
- [x] Footer
- [x] Add image lightbox as an additional gallery control, preserving rotation and access dialog.
- [ ] Complete cross-device visual and accessibility review
- [x] Add scroll reveals without hiding no-JS content; respect reduced motion.

### 5. Preserve Existing Work And Close Gaps

- [x] Track all ten existing published homepage sections and collections accurately.
- [x] Add frontend `.env.example` and document the separate create-only inquiry token.
- [x] Document content/media export and import; keep seeds disconnected from normal startup.
- [x] Handle missing CMS settings without an uncaught error and bound fetch duration.
- [x] Load all published pages for Gallery, Features, Press Item and Comments.
- [x] Configure Strapi `PUBLIC_URL` and keep section keys non-localized.
- [x] Retain last successful public reads during CMS outages; tested deletion and draft isolation.
- [ ] Replace sample phone, availability, copyright and testimonial text with approved content.
- [x] Implement opt-in SMTP notifications after inquiry persistence; delivery failure does not lose the entry.
- [ ] Configure approved SMTP sender/recipient and verify real delivery (credentials required).
- [x] Verify Next.js and Strapi production builds locally.
- [ ] Verify the real deployment environment after hosting is selected.

## Remaining External Work And Deferred Scope

### Process

The process block is commented out in `bott-monument-design/index.html`. Add only if the client asks for it.

- [ ] Add `Process Step` collection type.
  Fields: `stepNumber`, `title`, `description`, `sortOrder`.
- [ ] Add `process` homepage section entry.
- [ ] Build Process section.

### API And Preview

- [x] Add protected preview entry and POST exit routes, uncached draft reads and banner.
- [x] Configure Strapi preview URL and matching local secrets.
- [x] Add authenticated revalidation endpoint and configure local publication webhook.
- [x] Use cached public homepage/news (60s) and dynamic uncached draft preview/API routes.

### Language

Ship **English only** (`lang="en"`). Do not add a language switcher, `/pt` routes or a second Strapi locale until the client asks. Keep the model ready so adding one language later is content work, not a rebuild.

Already in place:

- Next root layout uses `lang="en"`.
- Strapi i18n plugin is available. `Homepage Section` is localized; `sectionKey` is not.
- Visible copy belongs in Strapi. Identifiers, URLs, `sectionKey` and DOM ids stay language-neutral.

When a second language is requested:

- [ ] Confirm the extra locale (likely `pt`) and whether the URL is prefix (`/pt`) or domain.
- [ ] Add that locale in Strapi **Settings → Internationalization**. Keep `en` as default. Do not duplicate `sectionKey`.
- [ ] Turn i18n on for remaining editorial types: Gallery, Comments, Press Item, Features, Site Settings. Leave Inquiries, Color Palettes and media unlocalized unless a field is actually language-specific.
- [ ] Next: locale segment or middleware, `html lang` per locale, GraphQL `locale` / `locale: "en"` default, localized metadata, and a simple language control only if design asks for it.
- [ ] Translate UI chrome that is still hardcoded in components (nav labels, form buttons, gallery access copy) via Strapi or a small message file — not scattered string edits.
- [ ] Cache, preview and revalidate must be locale-aware (separate cache keys per locale).
- [ ] Fallback: missing translation shows English, never an empty section.

Until then the public site stays a single-language English document.

### Plugin review

Review which Strapi plugins and providers are actually needed before production. Remove or leave unused ones disabled so the admin and attack surface stay small.

| Plugin / provider | Why it is here | Needed now? |
| --- | --- | --- |
| GraphQL (`@strapi/plugin-graphql`) | Next reads content through GraphQL | **Keep** |
| Upload (core) | Media library; local disk, optional S3 | **Keep** |
| i18n (core `@strapi/i18n`) | Homepage Section already localized; second language later | **Keep** — do not strip it |
| Users & Permissions | Strapi default; public API roles | **Review** — API tokens may be enough; confirm no visitor login |
| Email + Nodemailer | Inquiry notifications | **Keep code**; enable only with SMTP credentials |
| S3 upload provider | Production media | **Keep dependency**; unused until `S3_BUCKET` is set |
| Cloud (`@strapi/plugin-cloud`) | Strapi Cloud deploy/link | **Review** — drop if hosting is Railway/other, not Strapi Cloud |
| Content Releases (core) | Scheduled publish batches | **Review** — keep only if editors will use releases |
| Review Workflows (core) | Multi-step editorial approval | **Review** — likely unused for this team size |

- [ ] Decide keep vs remove for Cloud, Content Releases, Review Workflows and Users & Permissions.
- [ ] If removing: uninstall, drop related env, confirm GraphQL, upload, i18n, preview and inquiry create still work.
- [ ] Document the final plugin list in `README.md` / `docs/DEPLOYMENT.md`.
- [ ] Do not add SEO, redirects, or extra i18n plugins unless a gap remains after this review.

Next.js stays lean: App Router, `next/font`, `next/image`. Biome formats; ESLint still lints `apps/web`. No extra Next plugins unless a hosting or i18n task requires one.

### Team Collaboration And Hosting

Local SQLite is okay for proof of concept, but not for real team content work.

Before serious content entry:

- [x] Install PostgreSQL driver and prepare environment-driven connection settings.
- [ ] Provision a destination and migrate/verify content with a backup (hosting credentials required).
- [x] Add optional S3-compatible upload provider and public media/CSP configuration.
- [ ] Migrate existing media to selected shared storage and verify delivery (storage account required).
- [ ] Decide hosting provider for Strapi.
- [ ] Decide hosting provider for Next.js.

Likely production shape:

```text
Next.js:   Vercel or similar
Strapi:    Railway
Database:  Railway Postgres, Neon, or Supabase Postgres
Media:     Cloudinary or S3-compatible storage
```

## Verification And Remaining Inputs

- All 14 code tests pass: gallery motion, full pagination, CMS outage fallback, editorial deletion, draft isolation and disabled/failed/escaped inquiry notifications. Frontend lint, both TypeScript checks and both production builds pass.
- Live checks: all 10 sections render, optimized media responds 200, preview banner/exit work, invalid secrets/external redirects and unsigned refresh are rejected. Authenticated refresh verified locally.
- All 10 original sections and 13 gallery / 7 features / 2 press / 9 comments remain published locally.
- Site Settings and the original logo are additionally published; bootstrap is restored and does not reseed editor content.
- Public cache uses Next Data Cache in production and a process-local last-success fallback. A cold process without cache cannot recover old content; media still requires its host.
- SMTP delivery and S3/Postgres migration are prepared, not activated or represented as tested services.
- Cross-device visual review remains open; browser interaction during this run was interrupted by concurrent user activity.
- Required user inputs: hosting/domain/storage accounts, email sender/recipient, real phone/availability, approved testimonials/copyright.
- Public language is English only. A second locale is planned, not implemented.
- Plugin keep-vs-remove review is open (Cloud, Releases, Review Workflows, Users & Permissions).
- Process remains intentionally excluded because its design block is commented out. It has not been added to the visible site.
- Deployment runbook: `docs/DEPLOYMENT.md`; CI checks: `.github/workflows/checks.yml`.

## Section Notes

### Hero

Target design:

- Full-screen background video/image.
- Large serif title.
- Last word styled gold and italic.
- Dark overlay over media.
- Bott logo in header.
- Desktop navigation aligned like original design.

Current Strapi data:

- `sectionKey`: `hero`
- `title`: `Crafted to stand forever.`
- `backgroundColor`: `#0A0A0A`
- `textColor`: `#F0EDE8`
- `video`: uploaded hero video

### Colors From Design

```text
Main black:       #0A0A0A
Deep:             #111008
Mahogany:         #1E1208
Gold:             #C9A050
Dim gold:         #8A6B2E
Bone:             #F0EDE8
Stone:            #A89880
News background:  #2C3A46
Contact blue:     #2C3A46
Press cream:      #F7F3ED
White:            #FFFFFF
```

### Typography From Design

```text
Display:  Cormorant Garamond
Utility:  Montserrat
Script:   Alex Brush
```

## Useful Commands

Start Strapi:

```bash
cd apps/cms
npm run develop
```

Start Next.js:

```bash
cd apps/web
npm run dev
```

Check Strapi:

```bash
cd apps/cms
npm run build
```

Check Next.js:

```bash
cd apps/web
npm run lint
npx next build --webpack
```

## Color Palettes — Implemented

- [x] `Color Palettes` collection with draft/publish and optional structured `theme.section-colors` groups for all eleven areas (header plus ten homepage sections).
- [x] `Site Settings.activePalette` relation selects the site-wide palette; server-rendered CSS variables also apply to `/news` and draft preview.
- [x] Primary and Secondary seeded and published locally; Primary is the initial default; subsequent editor selections are preserved. Additional palettes can be created/duplicated and selected without code changes.
- [x] Palette colors override legacy Homepage Section color fields. Empty values retain exact original CSS fallbacks; no content, media, geometry or interactions are replaced.
- [x] Background gradients, text/accent/surface colors, controls, testimonial fade masks and showroom photo shading use palette variables. Hex validation prevents arbitrary CSS values.
- [x] Tests cover custom palette names, all sections, gradient serialization, invalid values, published/draft API reads and legacy-color precedence.
- [x] README includes the editing/publishing workflow. The seed is explicit and idempotent; the normal CMS bootstrap does not overwrite palettes.
- [x] Validation: 19 frontend/unit tests pass, lint and TypeScript checks pass, and both production builds pass. Switching the actual published Strapi selection to Secondary changed the rendered founder/news colors; Primary was restored afterward. An isolated browser verified custom backgrounds/headings/cards/buttons at 1440px and no horizontal overflow at 390px. This validates the palette work; the broader full-site accessibility/content review remains separate.

Secondary colors are extracted from the local HTML. Its alternate press and showroom **layouts** remain outside this colors-only feature. Blank fields deliberately retain the current design details. After publishing palette edits or changing `activePalette`, the open page synchronizes colors on focus/visibility/pageshow and every 30 visible seconds (5 in preview). `/api/color-palette` bypasses the page cache and respects draft cookies. Updating colors preserves DOM state, form inputs and gallery interactions; failed requests retain the current palette.

Palette follow-up: compared both modes by rendering the local HTML, found and corrected the missed Secondary gallery background (`#0A0A0A`) in the seed and local published entry. Featured In, testimonials, contact and footer have the same colors in both original modes. Existing Secondary selection was retained. Added regression tests for fresh production reads, stale variable removal and the gallery seed. Follow-up verification: 22 tests, lint and production build pass. An isolated browser confirmed switching an open tab on focus without losing form input, and retaining colors during a CMS error.

## Local SQLite Data Migration — Implemented

The team receives the content/media export and its key through Git, then imports
into existing SQLite using Strapi's built-in CLI. The README starts with the
commands. Back up the destination first: import replaces content/media rather
than merging records, while preserving local inquiries and environment/admin/API
configuration. The repository is public, so inquiries are excluded from the snapshot.

- [x] Prepared the data-only export and key in `handoff/`, with Git ignore exceptions for exactly those two files.
- [x] Exported from an isolated SQLite snapshot without stopping the user's CMS.
- [x] Verified the public snapshot restores 130 entities, 197 links and 120 media files using the CMS schemas included in this commit; publication states, document IDs, components, selected palette and all media hashes match.
- [x] Tested import into an existing SQLite copy: its inquiry, admin accounts, API tokens/permissions and webhook configuration were preserved. The user's running CMS was unchanged.
- [x] Source admin credentials, API tokens and webhooks are excluded.
- [x] [SQLite migration guide](docs/LOCAL_SQLITE_HANDOFF.md) includes backup/import commands for the existing checkout.

## Page Builder Motor

Homepage rendering no longer uses a `switch` in `page.tsx`. Sections go through
`usePage` → mappers → `RenderPage`. Strapi is unchanged in this phase.

- [x] Frontend motor (registry, mappers, `usePage`, `RenderPage`) on the current `Homepage Section` schema.
- [ ] Esmael: Strapi Dynamic Zone `Page.content` and the follow-up items in [PAGE_BUILDER_PLAN.md](docs/PAGE_BUILDER_PLAN.md). Do not block the motor on that CMS work.

## Rules For The Team

- Do not commit `.env` files.
- Do not commit `node_modules`.
- Do not commit `.next`, `build`, `.tmp`, or local database files.
- Pull latest code before starting work.
- Update this file when a task is finished.
- Keep editable content in Strapi.
- Keep layout, animation, and design behavior in Next.js.
- Match `sectionKey` and anchor ids to the design map above.
- Do not port design-only switchers into the Next app.
- English is the only public language until a second locale is explicitly requested.
- Keep `sectionKey`, slugs and ids non-localized. Localize visible copy only.
- Add homepage sections via `apps/web/src/page-builder/` (mapper + registry). CMS Dynamic Zone work is tracked in `docs/PAGE_BUILDER_PLAN.md` for Esmael.
