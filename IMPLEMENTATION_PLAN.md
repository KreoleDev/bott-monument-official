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
- Local SQLite for now.
- Railway likely later for Strapi hosting.

## Source Of Truth

- Published design: `https://kreoledev.github.io/bott-monument/`
- Local design file: `bott-monument-design/index.html`
- Frontend app: `apps/web`
- Backend app: `apps/cms`
- Main Strapi content type: `Homepage Section`
- Strapi schema file: `apps/cms/src/api/homepage-section/content-types/homepage-section/schema.json`
- Next Strapi client: `apps/web/src/lib/strapi.ts`
- Working conventions: `README.md`

Do not ship design-only controls from the HTML (Primary/Secondary mode, headline switchers, gallery layout pickers). Those are mockup tools, not product.

## Design To Product Map

Use these `sectionKey` values and DOM ids. Do not invent parallel names.

| Design block | HTML id | `sectionKey` | Next component today |
| --- | --- | --- | --- |
| Nav | `#navbar` | — (Site Settings logo) | `Header` (partial, wrong anchors) |
| Hero | `#hero` | `hero` | `Hero` (Strapi, incomplete) |
| Marquee | `#marqueeStrip` | `marquee` | missing |
| Founder intro (Drew) | `.page2-wrap` | `founder-intro` | `Philosophy` (placeholder, rename) |
| Masterpieces / work | `#work` | `work` | missing |
| Press | `#press-clippings` | `press` | missing |
| Gallery | `#magazine` | `gallery` | `Gallery` (placeholder) |
| Showroom / about | `#founder` | `founder` | `About` (placeholder, id `#about`) |
| Testimonials | `#testimonials` | `testimonials` | `Testimonials` (placeholder) |
| Contact | `#contact` | `contact` | `Contact` (placeholder, no form) |
| Footer | `footer` | `footer` | `Footer` (placeholder) |

Process (`ART PROCESS FEATURE`) is commented out in the design. Keep it out of MVP.

Nav anchors must match the HTML: `#work`, `#magazine`, `#contact`, `#founder`.

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

Ship a site that matches the published design and is editable in Strapi. Do not start preview, Postgres, or hosting until this list is done.

### 1. Finish Backend Content Model

- [ ] Stop localizing `sectionKey`. Identifiers must stay stable across locales.
- [ ] Add `Gallery Item` collection type.
  Fields: `title`, `category`, `image`, `description`, `sortOrder`, `featured`.
- [ ] Add `Testimonial` collection type.
  Fields: `name`, `quote`, `location`, `image`, `sortOrder`.
- [ ] Add `Press Item` collection type.
  Fields: `title`, `source`, `date`, `image`, `url`, `sortOrder`.
- [ ] Add `Inquiry` collection type for the contact form.
  Fields: `name`, `email`, `intent`, `message`, `status`.
- [ ] Add `Site Settings` single type.
  Fields: `logo`, `phone`, `email`, `address`, `facebookUrl`, `instagramUrl`, `seoTitle`, `seoDescription`, `commissionsRemaining`, `commissionsTotal`.

### 2. Add Homepage Section Entries

Create and publish these entries in Strapi. Copy text, colors, images, and videos from the design file.

- [x] `hero`
- [ ] `marquee`
- [ ] `founder-intro`
- [ ] `work`
- [ ] `press`
- [ ] `gallery`
- [ ] `founder`
- [ ] `testimonials`
- [ ] `contact`
- [ ] `footer`

### 3. Frontend Foundation

- [x] Add local setup instructions to `README.md`.
- [ ] Add shared color constants from the design.
- [ ] Load design fonts with `next/font`: Cormorant Garamond, Montserrat, Alex Brush.
- [ ] Add fallback content for every section.
- [ ] Update `next.config.ts` `images.remotePatterns` for Strapi media URLs.
- [ ] Query all homepage sections ordered by `sortOrder`.
- [ ] Drive `layout.tsx` metadata from Site Settings.
- [ ] Replace temporary section placeholders with real layouts.
- [ ] Rename `Philosophy` → founder intro and `About` → founder/showroom.
- [ ] Fix header anchors to `#work`, `#magazine`, `#contact`, `#founder`.
- [ ] Add mobile navigation.

### 4. Build The Sections

Header and Hero exist but are not the finished design. Rebuild against the HTML.

- [ ] Header/navigation (desktop + mobile)
- [ ] Hero
- [ ] Marquee
- [ ] Founder intro (Drew / page 2)
- [ ] Masterpieces/work (`#work`)
- [ ] Press (`#press-clippings`)
- [ ] Gallery (`#magazine`), including lightbox
- [ ] Gallery access modal ("Want to see the full gallery?")
- [ ] About/founder showroom (`#founder`, stats, visit CTA)
- [ ] Testimonials
- [ ] Contact copy + commission counter
- [ ] Contact form (intent pills, name, email, message) → Strapi `Inquiry`
- [ ] Footer
- [ ] Scroll reveal / motion from the original design

## Later — Not MVP

### Process

The process block is commented out in `bott-monument-design/index.html`. Add only if the client asks for it.

- [ ] Add `Process Step` collection type.
  Fields: `stepNumber`, `title`, `description`, `sortOrder`.
- [ ] Add `process` homepage section entry.
- [ ] Build Process section.

### API And Preview

- [ ] Add Next.js draft preview route.
- [ ] Configure Strapi preview URL.
- [ ] Add webhook from Strapi to Next.js for revalidation.
- [ ] Decide which pages use static generation and which use dynamic rendering.

### Team Collaboration And Hosting

Local SQLite is okay for proof of concept, but not for real team content work.

Before serious content entry:

- [ ] Move Strapi database to hosted PostgreSQL.
- [ ] Move Strapi media to shared storage.
- [ ] Decide hosting provider for Strapi.
- [ ] Decide hosting provider for Next.js.

Likely production shape:

```text
Next.js:   Vercel or similar
Strapi:    Railway
Database:  Railway Postgres, Neon, or Supabase Postgres
Media:     Cloudinary or S3-compatible storage
```

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
Work background:  #181A1B
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
