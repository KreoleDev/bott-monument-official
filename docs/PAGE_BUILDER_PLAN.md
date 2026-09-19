# Page Builder Plan

Current state: **2026-09-18**.

## Implemented

- [x] Page collection with draft/publish, stable `slug`, localized content and SEO.
- [x] `home` populated from the original content, preserving media and nested fields.
- [x] Fixed Header, Hero and Footer fields; eight middle Dynamic Zone block types.
- [x] Editor displays Header → Hero → middle sections → Footer, initially collapsed.
- [x] Typed GraphQL query, preview, caching/revalidation and per-page SEO.
- [x] Optional item selections; empty selections use all published collection items.
- [x] Contact submission validation uses the published Page choices.
- [x] Homepage Section retired from schema, GraphQL, local SQLite and seed code.

## Current flow

`Page.header / hero / content / footer` + collections + Site Settings
→ `getPage` → existing visual components and `RenderPage`.

`SectionContent` is a presentation props type, not a CMS content type.
The middle list supports Marquee, Founder, News, Featured In, Gallery, Showroom,
Testimonials and Contact. Only these blocks can be dragged. Header owns the logo,
site name and navigation links. Home SEO owns metadata and social image, also used
as site-wide defaults. Site Settings contains only public URL, social links and
active palette; header scroll colors remain in the palette.

## Retirement — 2026-09-18

Backed up SQLite, verified complete Home drafts and published content, deleted all
10 legacy documents through Strapi (including their owned nested components), then
removed the collection schema and its database tables. Page versions, media and
independent collection records were preserved. The old copy commands and their
migration-only tests were retired. Old snapshots/backups remain recovery artifacts;
they are not compatible imports for the current schema.

A teammate still using Homepage Section needs a backup and verified migration or
compatible handoff before starting this schema-removal version. The retired copy
commands are no longer provided; do not run old instructions against this schema.

## Admin integration

`src/admin/app.tsx` orders Page fields and collapses the fixed cards and SEO.
Middle blocks use native Strapi controls. Two Vite aliases reuse Strapi 5.53
internal input renderers to retain media, relations, validation and permissions.
Recheck the admin build and editor interactions when upgrading Strapi.

## Remaining

- Full visual/editorial acceptance against the local design.
- Refresh the public content/media archive with Pages and test import into a copy
  of an existing SQLite installation, preserving private records and accounts.
- Additional slug routes, Art Process and extra languages are future scope.
  `/news` remains a dedicated route using Press Item.

## Latest verification

29 frontend tests and 3 CMS integration tests passed after retirement; both
production builds and source lint passed. The editor was checked in an isolated
browser for ordering, closed cards, opening fields and absence of automatic
unsaved changes. Local Page rendering and independent draft/published reads were
verified. Full visual/accessibility acceptance and a new archive restore remain
pending, as listed above and in [the project plan](../IMPLEMENTATION_PLAN.md).
