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

- [x] Add `Gallery` collection type (`gallery-item`).
  Fields: `title`, `subtitle`, `image`, `imagePosition`, `sortOrder`.

- [ ] Add `Process Step` collection type.
  Fields: `stepNumber`, `title`, `description`, `sortOrder`.

- [ ] Add `Testimonial` collection type.
  Fields: `name`, `quote`, `location`, `image`, `sortOrder`.

- [x] Add `Press Item` collection type.
  Fields: `title`, `source`, `date`, `category`, `image`, `url`, `sortOrder`, `featured`.

- [ ] Add `Site Settings` single type.
  Fields: `logo`, `phone`, `email`, `address`, `facebookUrl`, `instagramUrl`, `seoTitle`, `seoDescription`.

### 2. Add Homepage Section Entries

Create and publish these entries in Strapi:

- [x] `founder`
- [ ] `process`
- [x] `gallery`
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
- [x] Gallery (circular layout and private-gallery request dialog)
- [x] About/showroom
- [ ] Process
- [x] Testimonials / Comments
- [x] As Featured In / press clippings
- [x] News / Featured Stories section, populated in Strapi and rendered through GraphQL.
- [x] Contact
- [x] Footer

## Section Notes

### Contact and Footer

- Replaced both placeholders with the local design's contact form and footer, including typography, inquiry pills, availability dots, button animation and responsive styles.
- **Homepage Section → contact**: edit eyebrow, title, description and buttonLabel; nested **contact** holds the italic title ending, form labels/options, confirmation, phone/studio/email and availability text/dot counts.
- **Homepage Section → footer**: nested **footer** holds brand, copyright and the two tagline lines.
- The design's phone placeholder, availability claim and 2025 copyright were copied as supplied and remain editable.
- **Inquiries** stores submitted name, email, inquiryType, message and status (new/reviewed/replied). No public read permission. Submissions are saved in Strapi; email notifications are not configured.
- `POST /api/inquiries` validates input and allowed CMS inquiry types, then uses GraphQL with a separate server-only create-only `STRAPI_INQUIRY_TOKEN`. Configure that environment variable when deploying; local `.env.local` is provisioned and ignored by Git.
- Form supports native radio/keyboard interaction, required name/email, pending state, confirmation only after persistence, and retry after errors.
- One-time content/token setup: `apps/cms/src/seeds/contact.ts`. Bootstrap restored after import.
- Verified contact/footer appearance in Chrome, successful persistence and invalid-email rejection, public read denial, and removal of the temporary test inquiry. Frontend lint and frontend/CMS TypeScript pass.

### Comments / Testimonials

- **Content Manager → Comments**: add any number of entries with quote, personName, location and sortOrder; publish to show them on the site. Draft entries are excluded.
- **Homepage Section → testimonials**: title is the opening heading, description is its gold italic phrase.
- Nine explicitly labeled placeholders from the local design are published for replacement with real reviews. Each exists only once in the CMS; visual copies provide the seamless scroll.
- GraphQL loads every page of published comments, ordered by sortOrder and documentId, with no fixed total limit.
- Uses local design card styles, staggered vertical motion, hover enlargement/pause and mouse drag. Arrow keys scroll, Space pauses; reduced motion disables automatic scrolling. All comments redistribute across three desktop, two tablet or one mobile column.
- One-time import: `apps/cms/src/seeds/comments.ts` and `.json`; bootstrap restored after import.
- Verified nine published records, homepage rendering and desktop animation/layout in Chrome; frontend lint and frontend/CMS TypeScript pass. `node --test apps/web/tests/comments.test.mjs` checks loading 205 comments over multiple pages and an empty collection.

### Showroom

- Added after Gallery using the primary showroom markup, photo, and responsive styles from local `bott-monument-design/index.html`.
- **Homepage Section → showroom**: edit the heading, eyebrow, background image, button label and destination. The nested **showroom** fields contain the visit heading, location, appointment details, hours and repeatable statistics.
- Original `office1.jpeg` is uploaded to Strapi; the section and its three statistics are published and rendered through GraphQL.
- About navigates to `#showroom`. Schedule a Visit navigates to `#contact`.
- One-time seed: `apps/cms/src/seeds/showroom.ts`; bootstrap restored after import.
- Validated authenticated GraphQL content, image HTTP 200, frontend/CMS TypeScript, frontend lint, and desktop appearance in Chrome.

### Gallery

- Source: active circular gallery in local `bott-monument-design/index.html`, with its original CSS, geometry, 13 images, captions, hover effect, rotation and drag sensitivity.
- **Content Manager → Gallery**: edit and publish each image, title, subtitle, imagePosition and sortOrder.
- **Homepage Section → gallery**: heading, colors, private-gallery button text, and the nested **galleryAccess** dialog text/buttons/contact link.
- All 13 original images are uploaded and published; the frontend reads `galleryItems` and the section through GraphQL. No frontend image/content fallback list.
- Behaviors: auto rotation; hover pause/enlargement; horizontal mouse/touch drag; vertical touch scrolling; responsive desktop/tablet/mobile geometry. Arrow keys rotate, Space pauses, and reduced-motion preferences disable auto rotation.
- Private Gallery opens the original request dialog. Close, Maybe Later, backdrop click and Escape dismiss it; Request Access links to Contact. Native dialog manages focus and background interaction.
- The inactive magazine-spread/video variant and its design switcher are commented out/hidden in the reference and are not part of the active circular gallery.
- One-time seed: `apps/cms/src/seeds/gallery.ts` and `.json`; bootstrap restored after import.
- Validation: five interaction tests in `apps/web/tests/gallery-motion.test.mjs`, frontend lint, frontend/CMS TypeScript, live GraphQL and all 13 media URLs. Gallery and open dialog visually inspected in Chrome.
- Run interaction tests: `node --test apps/web/tests/gallery-motion.test.mjs` from the repository root.

### As Featured In

- Added after News using the local design's primary press-clippings layout.
- **Content Manager → Features** contains seven published entries. Edit each image, title, publication, detail, featured toggle and sortOrder here.
- **Homepage Section → featured-in** holds the section heading, eyebrow and colors.
- The frontend queries published `features` through GraphQL, ordered by sortOrder. Mark one entry featured to choose the initial center image.
- Clicking a thumbnail changes the center image and caption; the center image opens the full image in a new tab. Mobile keeps every cover selectable.
- The duplicate homepage clippings field, component model, and completed migration/import code have been removed. Features is the only source for these covers and captions.
- Original captions are copied as supplied in the local design, including its dates and publication names.

### News / Featured Stories

- Source: the `#work` section of local `bott-monument-design/index.html`.
- Component and styles: `apps/web/src/components/news.tsx` and `news.css`.
- Placed after Founder; the existing Masterpieces navigation link targets `#work`.
- `Press Item` entries support drafts and publishing. GraphQL reads published entries ordered by `sortOrder`, then newest date.
- Homepage shows up to two featured stories; `/news` lists all returned stories (up to 100).
- Both original stories are published as Press Items, with their images uploaded to the Strapi Media Library. Frontend article fallbacks have been removed; both pages use GraphQL content.
- The `news` Homepage Section is published with the original headline, detail lines, description, background/text colors and coverage link.
- One-time import implementation: `apps/cms/src/seeds/news.ts`. It was run locally and is not attached to bootstrap, so later editorial deletions or unpublishing will be respected.
- `Homepage Section` key `news`: `eyebrow` for Our Work, `title` for the headline, `quote` for the three detail lines (newline-separated), `description` for the closing paragraph, and `backgroundColor` for the section background. Empty fields retain the design defaults.
- To populate Strapi: Content Manager → Press Item → Create entry; fill title, source, date, category, image, URL, sortOrder and featured, then publish. Set featured on the two stories intended for the homepage. Development requests fetch current CMS data; production content uses 60-second cache revalidation.
- Verified frontend lint, frontend/CMS TypeScript, live authenticated GraphQL, and HTTP 200 responses/content for `/` and `/news`. Visual browser verification remains outstanding.

### Founder

- Component: `apps/web/src/components/founder.tsx`; Strapi key: `founder`.
- Published content uses `eyebrow`, `title`, `description`, `image`, `quote`, `signature`, `personName`, and `personRole`.
- `backgroundColor` accepts a CSS gradient; the reference uses `linear-gradient(120deg, #F6F1E7, #E7D3A6, #F6F1E7)`.
- `textColor` controls the main heading and name; supporting text uses the original design's individual colors. Gold emphasis and decorative details stay in frontend CSS.
- The single-line title `The Most Trusted Name in Memorial Artistry` renders with a line break before `in` and gold italic emphasis on `Memorial Artistry`.
- Desktop CSS is copied from the local design, with explicit normal line height to prevent Tailwind inheritance from changing its spacing. The cream/gold background stays static to match the reference's rendered behavior; a stacked layout supports mobile.
- Lint, TypeScript, and rendered HTML checks pass. Browser visual comparison remains to be done.

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
