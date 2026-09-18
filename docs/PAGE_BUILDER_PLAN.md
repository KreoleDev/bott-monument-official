# Page Builder Plan

Homepage rendering uses a small motor: registry → mapper → `getPage` →
`RenderPage`. Strapi is **not** changed in this phase.

Owner of the CMS follow-up: **Esmael**. Anything the current schema cannot
express is listed under [Strapi follow-up](#strapi-follow-up-esmael).

## Now (this branch)

Replace the homepage `switch (section.sectionKey)` with a small motor:

```text
Homepage Section + collections
  → getPage()
  → mapSections() / mappers
  → RenderPage + fragment registry
  → existing React components (unchanged)
```

Files:

```text
apps/web/src/page-builder/
  types.ts
  mappers.ts
  map-sections.ts
  get-page.ts
  registry.ts
  render-page.tsx
  index.ts
```

Rules:

- CMS shape stays in mappers. Components keep today's props.
- A new section is a mapper + registry entry. Do not add switches to `page.tsx`.
- Header / Footer / Preview / ScrollReveal stay chrome (outside `<main>`), same as today.
- Unknown `sectionKey` values are skipped.
- No Dynamic Zones, no new Strapi content types, no visual redesign.

## How to add a section (frontend, current schema)

1. Publish a `Homepage Section` with a stable `sectionKey`.
2. If it needs a list, use an existing collection type (or ask Esmael for a new one).
3. Add a mapper in `mappers.ts` and a component entry in `registry.ts`.
4. Keep layout and motion in the React component, not in the motor.

## Later (after Esmael adjusts Strapi)

When Dynamic Zones exist, the motor stays. Only the data source and mappers
change:

1. `getPage` reads `Page.content` instead of a flat `Homepage Section` list.
2. Mappers key off `__typename` (`ComponentPagesHero`, …) instead of `sectionKey`.
3. Each fragment can own its GraphQL join.
4. Components should not need a rewrite if mappers keep the same props.

Optional after that: slug pages (`/news` as a CMS page), header/footer as
layout fragments, Art Process section.

---

## Strapi follow-up (Esmael)

Do **not** block the frontend motor on these. Documented so the CMS can catch
up without another homepage rewrite.

### Cannot model cleanly today

| Need | Current workaround | Desired Strapi shape |
| --- | --- | --- |
| Ordered homepage blocks with typed fields | One generic `Homepage Section` bag; unused component fields sit on every entry | Collection or single `Page` with **Dynamic Zone** `content` |
| Marquee phrases | `title` split on `\|`, plus hardcoded fallbacks in `marquee-strip.tsx` | Repeatable component `marquee.item` `{ label }` |
| Header nav links | Hardcoded in `header.tsx` | Repeatable `navigation.link` `{ label, href }` on Site Settings or a Header single type |
| Footer as layout, not a homepage block | `sectionKey: footer` skipped in `<main>` | Footer component on Site Settings / Page, not a section in the zone |
| Section → list items | Page loads **all** Press / Gallery / Features / Comments | Optional relations on each DZ component; empty relation = current “all published, sorted” fallback |
| Per-block GraphQL | One `HOMEPAGE_FIELDS` query for every section | Fragment joins (`... on ComponentPagesGallery { ... }`) |
| Per-page SEO | Only global Site Settings SEO | SEO component on `Page` |
| Extra pages (e.g. `/news`) | Dedicated Next route + collection fetch | `Page.slug` + same motor |
| Art Process (`#process`) | Out of MVP; commented in the design HTML | Optional DZ component when editorial wants it |

`contact`, `showroom`, `footer`, `galleryAccess` nested components already exist
but live on the generic Homepage Section, so every section *can* carry them.
In Dynamic Zones, attach each component only to the block that uses it.

### Suggested content types

**`Page`** (collection, draft/publish, i18n on copy only):

- `slug` (not localized, unique) — `home` for the homepage
- `title`, `seo` (meta title/description/image)
- `content` Dynamic Zone, allowed components below

**Dynamic Zone components** (map 1:1 with today’s `sectionKey`):

| Component | Fields to move | Relations |
| --- | --- | --- |
| `pages.hero` | title, description, button, colors, video | — |
| `pages.marquee` | — | repeatable `marquee.item` |
| `pages.founder` | title, description, quote, signature, person, image, colors | — |
| `pages.news` | eyebrow, title, description, button | optional `press-item` (many) |
| `pages.featured-in` | title, description | optional `feature` (many) |
| `pages.gallery` | title + `gallery.access` | optional `gallery-item` (many) |
| `pages.showroom` | `showroom.details` + image | — |
| `pages.testimonials` | title, description | optional `comment` (many) |
| `pages.contact` | `contact.details` | inquiries stay a separate collection for submissions |
| `pages.process` | later, not MVP | — |

Keep existing collections: Press Item, Feature, Gallery Item, Comment, Inquiry,
Color Palette, Site Settings.

**Header:** add nav links to Site Settings (or `Header` single type). Logo/SEO
already live there.

**Footer:** move `footer.details` off Homepage Section onto Site Settings or Page.

### Migration notes

- Keep published copy. Seed/mapping: `sectionKey` → DZ `__typename`.
- Keep `en` as the only public locale; do not localize slugs or component UIDs.
- After the schema lands, tell the frontend: `getPage` will switch to `Page`
  by slug and mappers will read `__typename`. No need to change Hero/Gallery/etc.
- Until then, editors keep using Homepage Section exactly as today.

## Out of scope

- Changing Strapi schemas or seeds in this branch
- Rewriting section visuals
- Porting design-only layout switchers
