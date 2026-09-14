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

## Next

### 1. Finish Backend Content Model

- [ ] Add `Gallery Item` collection type.
  Fields: `title`, `category`, `image`, `description`, `sortOrder`, `featured`.

- [ ] Add `Process Step` collection type.
  Fields: `stepNumber`, `title`, `description`, `sortOrder`.

- [ ] Add `Testimonial` collection type.
  Fields: `name`, `quote`, `location`, `image`, `sortOrder`.

- [ ] Add `Press Item` collection type.
  Fields: `title`, `source`, `date`, `image`, `url`, `sortOrder`.

- [ ] Add `Site Settings` single type.
  Fields: `logo`, `phone`, `email`, `address`, `facebookUrl`, `instagramUrl`, `seoTitle`, `seoDescription`.

### 2. Add Homepage Section Entries

Create and publish these entries in Strapi:

- [ ] `philosophy`
- [ ] `process`
- [ ] `gallery`
- [ ] `about`
- [ ] `testimonials`
- [ ] `contact`
- [ ] `footer`

Use the original design file for text, colors, images, and videos.

### 3. Frontend Foundation

- [ ] Add shared color constants from the design.
- [ ] Add fallback content for every section.
- [ ] Update `next.config.ts` for Strapi media URLs.
- [ ] Query all homepage sections ordered by `sortOrder`.
- [ ] Replace temporary section placeholders with real layouts.
- [ ] Add local setup instructions to `README.md`.

### 4. Build The Sections

- [ ] Header/navigation
- [ ] Hero
- [ ] Masterpieces/work
- [ ] Gallery
- [ ] About/founder
- [ ] Process
- [ ] Testimonials
- [ ] Press
- [ ] Contact
- [ ] Footer

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

## API And Preview Later

- [ ] Add Next.js draft preview route.
- [ ] Configure Strapi preview URL.
- [ ] Add webhook from Strapi to Next.js for revalidation.
- [ ] Decide which pages use static generation and which use dynamic rendering.
- [ ] Keep GraphQL token server-side only.

## Team Collaboration Later

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

## Rules For The Team

- Do not commit `.env` files.
- Do not commit `node_modules`.
- Do not commit `.next`, `build`, `.tmp`, or local database files.
- Pull latest code before starting work.
- Update this file when a task is finished.
- Keep editable content in Strapi.
- Keep layout, animation, and design behavior in Next.js.
