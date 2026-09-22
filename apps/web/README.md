# Bott Monument frontend

Next.js 16, React 19, TypeScript and Tailwind 4. Use Node 22 and npm.
Visual source: `../../bott-monument-design/index.html`.

## Run locally

From `apps/web`, run `npm ci`. On a new installation only, copy `.env.example` to
`.env.local`; preserve an existing file. Configure the server-only Strapi URL and
read token, plus a separate create-only inquiry token. Start the CMS separately.

```bash
npm run dev
```

Site entry: http://localhost:3000 (language detection). English:
http://localhost:3000/en. CMS: http://localhost:1337.
A published Page with slug `home` and its content must exist; no demo body is
silently substituted when the CMS is unavailable or the Page is missing.

## Data and presentation

- Every published Home localization resolves at `/{locale}`; English uses `/en`.
  Its press archive resolves at `/{locale}/news`. `/` and `/news` detect the browser
  language and redirect to an available published Home locale, with English fallback.
- Header/Hero/Footer render in fixed positions; middle blocks follow Page.content order.
- `src/page-builder/` contains the loader, adapters, registry and renderer.
- Existing visual components consume `SectionContent`, a presentation type, not a CMS collection.
- `/en/news` is the English Press Item route. Other Page slugs do not automatically create public routes.
- Collections/selections are paginated; empty block selections use all published items.
- Site Settings supplies the public URL, social links and active palette. Home Header owns the site name, menu and logo. Home SEO supplies metadata defaults, including the social image; /news retains its own title.
- Fonts: Cormorant Garamond, Montserrat and Alex Brush through `next/font`.
- Next Image media origins derive from `STRAPI_URL` and `MEDIA_ORIGINS`.

Published reads use a 60-second production cache and authenticated revalidation.
Preview uses uncached draft reads, a banner and POST exit. Failed reads retain the
last complete public result when available; valid empty results replace it.
Contact submissions validate against the published Page and save private Inquiries.

## Checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

CI uses `npm run build -- --webpack`. To isolate output while development runs:

```bash
NEXT_DIST_DIR=.next-build npm run build -- --webpack
```

Recorded results and the remaining visual, content and launch work are in the
[project plan](../../IMPLEMENTATION_PLAN.md). Source lint in a checkout that
contains generated `.next` output needs
`npm run lint -- --ignore-pattern '**/.next/**'`. Clean CI uses normal lint.

Read [AGENTS.md](AGENTS.md) and the installed Next documentation before framework
changes. Shared setup is in the [root README](../../README.md); operations are in
[DEPLOYMENT.md](../../docs/DEPLOYMENT.md).
