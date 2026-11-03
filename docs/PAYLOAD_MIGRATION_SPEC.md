# Spec: Strapi to Payload

Status: **proposal**. Written 2026-10-29 from `dev`. Not approved. Not launch work.

This file records the impact of leaving Strapi 5.53 and the shape of a migration if the team later approves it. It does not change the Railway plan in [DEPLOYMENT.md](DEPLOYMENT.md) or the open checklist in [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md).

## Recommendation

Stay on Strapi through launch. Payload does not import this project. The public site, the editor, private gallery, inquiries and deployment are built against Strapi schemas, GraphQL, draft status and admin internals.

Switch only if the team wants one Next.js process and accepts a CMS rewrite. The shape that pays for that rewrite is **Payload 3 inside `apps/web`**, with the Local API, Postgres and the existing S3 bucket. A second Payload service that the site still calls over HTTP keeps the operational split and still requires the rewrite.

Do this after the public site is live, or accept that launch slips by the length of the phases below. Sitemap, share previews, image zoom, SMTP and content cleanup do not depend on this change.

## What stays

The visitor-facing site can keep its routes, locale redirect, visual components, CSS and the `SectionContent` view model. A new loader fills that model. Header, hero, gallery, showroom, contact form and Turnstile do not need a redesign.

Postgres and the public media bucket stay. Object keys and the media table are rewritten. Strapi's own tables are not reused.

## What has to be rebuilt

### Content model

Eleven content types and twenty-one components. Page is the core: draft and publish, localized editorial fields, a non-localized `slug`, fixed header, hero, footer, SEO and private-gallery blocks, and a dynamic zone of eight middle sections (marquee, founder, news, featured-in, gallery, showroom, testimonials, contact). Site Settings is a single type related to Color Palette.

Payload equivalents:

| Strapi today | Payload 3 |
| --- | --- |
| Collection type | Collection |
| Single type `site-setting` | Global |
| Component | Group, or a block when it is one of several section types |
| Dynamic zone `Page.content` | `blocks` field, order preserved |
| `draftAndPublish` | `versions.drafts` |
| i18n plugin, slug not localized | Localization config, `localized: false` on `slug` |
| Relation | Relationship field |
| Upload file | Upload collection |
| Lifecycle `afterCreate` / `afterUpdate` | Collection hooks |
| `documentId` | Payload `id`, with an explicit map during import |

Field names that the site already renders (`metaTitle`, section keys, palette colors, gallery access copy) stay stable so the React components do not move.

### Public reads

`apps/web/src/lib/cms-cache.ts` is the only read path: GraphQL POST to `STRAPI_URL` with `STRAPI_API_TOKEN`, or `STRAPI_PREVIEW_TOKEN` in draft mode. Queries live in `page-query.ts`, `pages.ts`, `site-settings.ts`, `news.ts`, `features.ts`, `gallery.ts` and `comments.ts`. Cache is a 60-second tag `cms`, bypassed for preview and development, with the last good public read kept in memory.

Inside one Next.js app, those reads become Payload Local API calls. Do not recreate the GraphQL schema. The cache and the empty/error behavior stay: a failed read must not invent content, and a real empty result must clear stale content.

### Admin

`apps/cms/src/admin/app.tsx` reorders the Page editor, collapses fixed cards and relabels fields by wrapping Strapi content-manager inputs. Vite aliases point at Strapi 5.53 internals. `header-rule-section.tsx` and `private-gallery-photos-input.tsx` are custom inputs. None of that code runs in Payload.

The editor outcome to preserve, rebuilt with Payload fields and admin components:

- Order: Header, Hero, middle sections, Footer, with SEO and fixed cards collapsed.
- Only the eight middle blocks can be reordered.
- Palette header-scroll rules show the section colors.
- Private gallery photos upload in the admin and are not public media.

The client has to accept the Payload admin before cutover. Matching every Strapi pixel is out of scope. Matching those editing tasks is in scope.

### Private gallery and inquiries

These are application behavior, not just fields.

- Gallery access stores a hash of a random token, a 7-day expiry, and sends the visitor a locale-aware link when an editor sets access active. Revoking access clears the hash. Notification failure must not lose the saved request.
- Private photos live on disk under `private-gallery-uploads` and `.private-gallery-uploads`, served only after the token and email check in `private-gallery` controller. They are not Strapi public uploads.
- Inquiries are created with a separate token that can only create inquiries and gallery-access rows. The Next route checks origin, Turnstile, size and image type, then writes through GraphQL. The inquiry lifecycle emails the studio. Email failure must not lose the inquiry.

In Payload this becomes access control plus hooks. Private photos become a private upload collection, not files on the service disk. The public site never receives a URL that works without the access check.

### Preview, revalidation, auth

Strapi's preview button hits `/api/preview` with `PREVIEW_SECRET` and enables Next draft mode for `/{locale}` and `/{locale}/news`. Saves of pages, palettes, items, settings and uploads call `/api/revalidate` with `REVALIDATION_SECRET`.

If Payload lives in the Next app, both become in-process: live preview, and `revalidateTag('cms')` from an `afterChange` hook. The shared secrets and the CORS list between two origins go away.

Strapi users-permissions, API tokens and admin JWT secrets go away. Payload's users collection is the only admin login. Public visitors do not get a CMS token.

### Data

Local Strapi uses SQLite. Production is planned as Railway Postgres. Payload uses its own Postgres schema (Drizzle). Pointing `DATABASE_URL` at the Strapi database does not migrate content.

Import must carry, per published and draft locale:

- Page `home` and `private-gallery`, including dynamic-zone order.
- Site Settings and the active palette.
- Press items, features, gallery items and comments that the page selects.
- Private gallery categories, items and photo files.
- Inquiries and gallery-access rows only if the studio wants the history. Tokens are hashes; plaintext links cannot be recovered. Approved visitors need a new approval email.

Do not import Strapi admin users, API tokens, or the pre-Page `handoff/` archive.

Public media can stay in the same bucket. Each file needs a Payload media document whose URL still works with `getStrapiMediaUrl`'s successor. Private disk files must be copied in the same migration. A Railway disk does not survive a service recreate, so those files have to be taken from the machine that currently has them.

## Deployment

Today the plan is three Railway pieces: Next.js, Strapi, Postgres, plus an S3 bucket. See [DEPLOYMENT.md](DEPLOYMENT.md).

| | Separate Payload service | Payload inside `apps/web` |
| --- | --- | --- |
| Processes | Still two Node services | One Node service plus Postgres |
| Site reads | HTTP, new client | Local API, no CMS token |
| Revalidation | Webhook stays | Hook in the same process |
| Admin | Own origin | `/admin` on the site origin |
| Failure domain | CMS can be down while a cached page remains | A CMS fault ships with the site |
| When to choose | Only if the admin must be on another host | This is the default if the migration is approved |

`/admin` on the public origin needs Payload auth, no public registration, and the same host hardening as the rest of the site. Preview and draft routes stay uncached.

Environment that disappears in the embedded shape: `STRAPI_URL`, `STRAPI_API_TOKEN`, `STRAPI_PREVIEW_TOKEN`, `STRAPI_INQUIRY_TOKEN`, `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, Strapi `CORS_ORIGINS`. `PREVIEW_SECRET` and `REVALIDATION_SECRET` disappear only when preview and revalidation are in-process. `DATABASE_URL`, S3 variables, SMTP and Turnstile stay.

## Phases

Each phase ends with the site still able to render the published home page from the CMS it is using. Do not run both CMSs as the editor of record.

1. **Spike.** Payload 3 in a branch of `apps/web`. One global or collection with hero and one block. Local API fills the current hero component. SQLite or local Postgres. No production data.
2. **Schema.** Collections, global, blocks and localization matching the table above. Access rules for public read, admin write, inquiry create and private photos. No custom admin polish yet.
3. **Read path.** Replace `cmsQuery` for page, settings, news, features, gallery and comments. Keep `SectionContent` and the React components. Draft reads stay out of the public cache. Tests that mock GraphQL move to the new loader.
4. **Writes.** Inquiry route, Turnstile, image limits, notification hook, gallery-access request, approval email, expiry, revoke, and private photo streaming.
5. **Editor check.** A person who edits the Strapi Page today reorders sections, changes the palette, previews a draft and uploads a private photo in Payload. Gaps found here are fixed before import.
6. **Import and cutover.** Freeze Strapi edits. Run the import. Compare published home, news, palette, one inquiry and one private-gallery approval against the Strapi site. Switch the Railway service. Remove `apps/cms` only after that check.

## Acceptance

- Published `/{locale}` and `/{locale}/news` match the current Strapi output for every locale that is actually published. English is the launch locale.
- Draft preview shows unpublished Page and palette changes and does not enter the public cache.
- A palette change updates the public site without a redeploy, within the existing revalidation behavior.
- An inquiry with images and a passed Turnstile check is stored. A failed notification still leaves the inquiry stored.
- Private gallery: request, approve, open the link, expire, revoke. Photo bytes are not available from a public media URL or an unauthenticated API.
- An editor can change header, hero, middle-section order and footer without a developer.
- Sitemap, robots and share metadata, when those tasks are done, read the same title, description and image as the site.

## Out of scope

- A new visual design, new sections, or a second public locale.
- Keeping GraphQL as the public API.
- Porting `app.tsx` or the Vite aliases.
- Running Strapi and Payload side by side as two editors.
- Strapi Cloud, the users-permissions plugin, or a Strapi SEO plugin.
- Importing `handoff/`.

## Risks

- The custom Page editor is the expensive unknown. Schema parity is smaller than teaching Payload's admin to do the same job.
- Private photos are the sensitive set. A public upload collection, or a missed access check, exposes them.
- Draft and published copies in Strapi 5 do not map one-to-one onto Payload versions. The import has to choose a winner per field and show the diff before cutover.
- Dynamic zone order is content. Losing it changes the homepage.
- The non-localized slug must stay one value across locales. Localizing it by default would split `home` per language and break the route.
- Doing this before launch delays SMTP, hosting, content approval, sitemap and share previews, which are already open on Strapi.
