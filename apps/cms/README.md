# Bott Monument CMS

Strapi 5.53 with GraphQL and local uploads. Use Node 22 and npm.
The database comes from `.env`: SQLite by default, or PostgreSQL when
`DATABASE_CLIENT=postgres`. See the [project README](../../README.md) for shared
setup and the [plan](../../IMPLEMENTATION_PLAN.md) for open work.

## Run locally

From `apps/cms`, install with `npm ci`. On a new installation only, copy
`.env.example` to `.env` and set the required secrets; preserve existing env files.

```bash
npm run develop
```

Admin: http://localhost:1337/admin. Run only one CMS instance on port 1337.
Normal startup does not seed content automatically.

## Content editing

**Page → Home**, slug `home`, owns the homepage:

- Header: logo, site name and menu links; fixed position.
- Hero: fixed before the middle sections.
- Content: Marquee, Founder, News, Featured In, Gallery, Showroom, Testimonials, Contact; reorderable.
- Footer: fixed after the main content.
- SEO: title, description and social image; Home SEO also provides site-wide defaults.

Cards start collapsed. Publish changes for public visitors; use Preview for drafts.
Press Item, Features, Gallery and Comments remain independent item collections.
Inquiries stores private form submissions. Site Settings holds social links, public URL and active Color Palette.
Edit the site name/logo in Home → Header and metadata in Home → SEO. Header scroll colors remain in palettes.

Page, Comments, Features, Gallery and Press Item are localized. Add or remove
languages under Settings → Internationalization. For an added language, create and
publish the Home localization and localize/publish the item records selected by its
blocks. The frontend then exposes `/{locale}` and `/{locale}/news`, including `/en`
for English. The bare `/` detects the browser language; no new React page is required.

**Homepage Section has been removed.** Do not import `handoff/` into this schema.
A blank database needs a new Page `home`, or a snapshot that has been
restore-tested. Details: [SQLite handoff](../../docs/LOCAL_SQLITE_HANDOFF.md).

Site Settings no longer stores the site name, logo or SEO. Those live on
Page → Home. `migrate:header-rules` remains available for an existing SQLite
file that still has header color rules; see the handoff guide.

## Checks

```bash
npm test
npm run build
npx tsc -p src/admin/tsconfig.json --noEmit
```

Tests use temporary SQLite databases, not the working data. The latest recorded
results are in the [project plan](../../IMPLEMENTATION_PLAN.md).

## Admin customization

`src/admin/app.tsx` orders Page fields and collapses fixed cards/SEO while keeping
native middle-section controls. `src/admin/vite.config.ts` aliases two Strapi 5.53
internal renderers. Recheck editor behavior, media/relations and permissions when
upgrading Strapi. No `node_modules` patches are used.

## Production and handoff

PostgreSQL, S3-compatible media and SMTP configuration are prepared, not deployed
or verified against live services. Do not commit secrets, working SQLite files,
local uploads or private inquiry data. See [deployment](../../docs/DEPLOYMENT.md),
[handoff](../../docs/LOCAL_SQLITE_HANDOFF.md) and the [remaining plan](../../IMPLEMENTATION_PLAN.md).

## Header color rules

Each Color Palette has a repeatable `headerScroll` list. Add a rule per section,
with enabled, section, header background and text colors. The section selector
shows live palette colors, gradient stops and photo overlay; inherited colors
are marked explicitly. First matching enabled rule wins; an empty list disables
all overrides. Publish changes to apply them to visitors.

On a stopped SQLite database that already has those rules, `npm run migrate:header-rules`
backs up the file, keeps the colors, sets list order, and renames `magazine` to
`gallery`. It does not create Page. See the handoff guide before running it.
