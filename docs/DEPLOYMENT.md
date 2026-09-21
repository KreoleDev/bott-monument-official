# Deployment and content operations

Current status: **2026-09-18**. Preparation is implemented; production launch remains pending.

**For developer-to-developer SQLite copies, use [LOCAL_SQLITE_HANDOFF.md](LOCAL_SQLITE_HANDOFF.md).**
The production infrastructure below is optional and is not required for that workflow.

The code is prepared for a Node-compatible Next.js host, a persistent Strapi service,
PostgreSQL, public S3-compatible media and SMTP. No production account or destination
has been selected or changed. Local SQLite and uploads remain authoritative for this demo.

## Protect the existing site

1. Keep the same Git revision and Strapi version on source and destination.
2. Stop the source Strapi process before exporting: `npm run strapi -- export --file ./exports/bott-content` from `apps/cms`.
3. Save the encrypted export and its key separately. It contains content and media;
   it may also contain inquiry details. Do not commit or publicly share it.
4. Provision an empty destination database/media store. Import replaces destination
   data, so back up any existing destination before proceeding.
5. Use Strapi's import command on the destination. Do not import into the current local
   database just to update code. Verify upload provider compatibility during migration.
6. Verify Page `home` with fixed Header/Hero/Footer, all eight middle blocks,
   selected item relations, Gallery, Features, Comments, Press Item, palettes and
   Site Settings. Verify independent drafts/publication, media and local accounts/tokens.

The committed pre-Page handoff archive is not compatible with the current schema.
Do not import it here. Refresh and restore-test the archive first; see the handoff guide.

## CMS service

- Root: `apps/cms`; Node 22; install: `npm ci`; build: `npm run build`; start: `npm start`.
- Set `HOST=0.0.0.0`, host-provided `PORT`, public HTTPS `PUBLIC_URL`, `WEB_URL`, and
  explicit `CORS_ORIGINS`.
- Generate production `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`,
  `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`.
- Set `DATABASE_CLIENT=postgres`, `DATABASE_URL`, and provider-required SSL settings.
  The PostgreSQL driver is installed. Do not reuse example secrets.
- Set `GRAPHQL_LANDING_PAGE=false`.
- If using S3, set `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`;
  optional `S3_ENDPOINT`, `S3_FORCE_PATH_STYLE` support compatible providers.
  `MEDIA_PUBLIC_URL` is the public delivery URL; list its origin in `MEDIA_CSP_ORIGINS`.
  Configure public image delivery on the storage provider. No bucket policy is created by this app.
- Leaving `S3_BUCKET` empty preserves local uploads. Those require persistent storage
  if deployed that way; an ephemeral filesystem will lose them.

## Frontend service

- Root: `apps/web`; Node 22; install: `npm ci`; build: `npm run build`; Node start: `npm start`.
- `STRAPI_URL` must resolve from the server and supply a browser-reachable media URL.
- `STRAPI_API_TOKEN`: content read-only token.
- `STRAPI_INQUIRY_TOKEN`: custom token with only `api::inquiry.inquiry.create`.
- `MEDIA_ORIGINS`: comma-separated public media origins for Next Image optimization.
  Local/private IP optimization is allowed only in development by the app's configuration.
- `PREVIEW_SECRET`, `REVALIDATION_SECRET`: match the CMS configuration.
- Optional `STRAPI_PREVIEW_TOKEN`: separate read token for draft requests.
- Set the public site URL in **Site Settings**. Set the site name/logo in **Page → Home → Header** and metadata/social image in **Home → SEO**.
- Set homepage logo/name/menu in **Page → Home → Header** and page SEO in its SEO card.

## Preview and publication refresh

- Strapi preview opens `/api/preview?secret=…&path=/` (or `/news`). Only these paths are
  allowed. Preview uses draft queries, bypasses public caches, and displays an exit form.
- In Strapi **Settings → Webhooks**, configure **Website content refresh**:
  URL: `https://YOUR_WEB_HOST/api/revalidate`; header `x-revalidation-secret` equal to
  `REVALIDATION_SECRET`; events: entry publish, unpublish, update and delete.
- A webhook already exists for the local installation. Update its URL for the deployed site.
  Secrets are held in local env/database, not source code.
- Public pages use Next.js caching with 60-second revalidation; webhook marks data stale.
  Draft requests use no-store. The eight middle sections follow `Page.content` order;
  Header, Hero and Footer occupy fixed positions. Item collections use their own sort order.
- Successful complete reads, including an intentional empty result, replace cached content.
  Failed reads preserve the last successful public result in the running process. Production
  also uses Next's persistent Data Cache. A cold process without a cached result shows the
  unavailable state; this is not an offline copy of media or a database backup.

## Inquiry notifications

Submissions are saved even when email is disabled or delivery fails.

- Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`,
  `EMAIL_FROM`, `EMAIL_REPLY_TO`, `INQUIRY_NOTIFICATION_TO`.
- After confirming sender/recipient, set `INQUIRY_NOTIFICATIONS_ENABLED=true`.
- The lifecycle sends an internal notification with the visitor as Reply-To. It does not
  send visitors an automatic email. Delivery failure is logged; review the saved inquiry
  and contact the visitor from the CMS workflow. Automatic retries are not implemented.
- This integration is disabled locally; real delivery has not been tested without credentials.

## Verification and launch

- Web: `npm run lint`, `npm test`, `npm run typecheck`, `npm run build -- --webpack`.
- CMS: `npm test`, `npx tsc --noEmit`, `npx tsc -p src/admin/tsconfig.json --noEmit`, `npm run build`.
- While local Next dev runs, isolate a build with `NEXT_DIST_DIR=.next-build npm run build -- --webpack`.
- Review desktop/mobile layouts, gallery drag versus image-opening, modal focus/close,
  reduced motion, long CMS content, real form submission, preview exit, and publication refresh.
- Replace sample phone, commission availability, copyright and testimonial copy with approved values.
- Review dependency audit findings before launch; do not use a forced major-version upgrade
  as an automatic fix. CI checks code/builds; it does not provision or migrate services.

## Completed local verification versus launch work

After locale routing, 31 frontend and 4 CMS tests, both production
builds and frontend source lint passed. The editor order/collapse/open behavior
and live Page rendering were checked locally. These results do not verify SMTP,
production hosting/storage, a new snapshot restore or a full accessibility audit.
The custom editor uses Strapi 5.53 internal renderer aliases; test that integration
when upgrading Strapi. Plugin keep/remove decisions remain open in the project plan.
