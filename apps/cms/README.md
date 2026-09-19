# Bott Monument CMS

Strapi 5.53 with GraphQL, local SQLite and local uploads. Use Node 22 and npm.
See the [project README](../../README.md) for shared setup and conventions.

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

**Homepage Section has been removed.** Its old copying scripts are retired.
The committed archive predates Pages: do not import it into this schema. Read
[SQLite handoff status](../../docs/LOCAL_SQLITE_HANDOFF.md) before transferring data.
A blank database needs new Page content or a future compatible, validated snapshot.

The one-time header migration is retired. Duplicate Site Settings branding/SEO
fields have been removed after verifying Home draft and published values.

## Checks

```bash
npm test
npm run build
npx tsc -p src/admin/tsconfig.json --noEmit
```

Latest verification (2026-09-18): three isolated CMS integration tests and CMS
production build passed. Tests use temporary SQLite databases, not the working data.
Admin TypeScript and browser checks passed during the editor change.

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

For existing SQLite databases, stop Strapi and run `npm run migrate:header-rules`
before restarting. This backs up SQLite, keeps existing rules and colors, sets
list order, and renames magazine to gallery in rules and menu links.
