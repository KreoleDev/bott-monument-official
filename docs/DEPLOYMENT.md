# Deployment plan

Decision: **2026-09-22**. Production is one Railway project in the client's
account. Open work stays in [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md).

| Piece | Where |
| --- | --- |
| Next.js site (`apps/web`) | Railway service |
| Strapi (`apps/cms`) | Railway service |
| Database | Railway Postgres |
| Images and video | S3-compatible bucket, public read |
| Account and card | Client. Kreoletech is a workspace member |
| Plan | Railway Pro ($20/month, includes $20 of usage) |

A quiet month stays inside that credit. Strapi, Postgres and the always-on
Next.js server together are expected around $20–45/month. Set a spend limit on
the workspace. Visitor payments are not part of Railway. A later checkout, if
any, is a separate client account.

Do not import `handoff/`. That archive is pre-Page. Developer copies follow
[LOCAL_SQLITE_HANDOFF.md](LOCAL_SQLITE_HANDOFF.md).

## 1. Account

1. The client creates the Railway account with an email the client controls, including recovery.
2. Upgrade that workspace to Pro and add the client's card. Set a monthly spend limit.
3. Invite Kreoletech as a member. Kreoletech does not own the workspace and does not put the client's card on an agency account.
4. Create one project for this site.

A Kreoletech Railway account may hold a temporary preview. It is not production, and it is discarded once the client project is live.

## 2. Services

Create three services in the project. Set Node 22 on the two app services.
Railway supplies `PORT`. Do not copy a local `.env` into the dashboard.
Generate new production secrets.

### Postgres

Add the Railway Postgres service. The CMS reads `DATABASE_URL` from that
service over the private network, with `DATABASE_CLIENT=postgres` and
`DATABASE_SSL=false` for the internal URL. Do not point `DATABASE_HOST` at
`localhost`.

### Strapi

- Root directory: `apps/cms`
- Build: `npm ci && npm run build`
- Start: `npm start`

Variables:

| Variable | Value |
| --- | --- |
| `HOST` | `0.0.0.0` |
| `PUBLIC_URL` | Public HTTPS URL of this service |
| `WEB_URL` | Public HTTPS URL of the Next.js service |
| `CORS_ORIGINS` | The public site origin only |
| `APP_KEYS` | Two new random keys, comma-separated |
| `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY` | New random secrets |
| `DATABASE_CLIENT` | `postgres` |
| `DATABASE_URL` | Railway Postgres private URL |
| `DATABASE_SSL` | `false` on the private network |
| `GRAPHQL_LANDING_PAGE` | `false` |
| `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Bucket credentials |
| `S3_ENDPOINT`, `S3_FORCE_PATH_STYLE` | Only for a non-AWS S3-compatible store |
| `MEDIA_PUBLIC_URL` | Public HTTPS origin of the bucket |
| `MEDIA_CSP_ORIGINS` | That same origin |
| `PREVIEW_SECRET`, `REVALIDATION_SECRET` | Shared with the Next.js service |

Leave `S3_BUCKET` empty only for a disposable preview. A Railway disk loses
uploads when the service is recreated. Production media is the bucket.

Create the first admin user on the public `/admin` URL. Then create two API
tokens: `web-readonly` (read-only) and `web-inquiries` (custom, only
`api::inquiry.inquiry.create`).

### Next.js

- Root directory: `apps/web`
- Build: `npm ci && npm run build`
- Start: `npm start`

Variables, all server-only:

| Variable | Value |
| --- | --- |
| `STRAPI_URL` | Public HTTPS URL of Strapi |
| `STRAPI_API_TOKEN` | `web-readonly` |
| `STRAPI_INQUIRY_TOKEN` | `web-inquiries` |
| `STRAPI_PREVIEW_TOKEN` | Optional second read-only token for drafts |
| `PREVIEW_SECRET`, `REVALIDATION_SECRET` | Same values as Strapi |
| `MEDIA_ORIGINS` | Public bucket origin |

No variable uses the `NEXT_PUBLIC_` prefix for the CMS URL or tokens.

### Domains

Attach the client's domain to the Next.js service and a CMS hostname, such as
`cms` on the same domain, to the Strapi service. Update `PUBLIC_URL`,
`WEB_URL`, `CORS_ORIGINS`, `STRAPI_URL` and `MEDIA_ORIGINS` to those final
HTTPS origins. In Strapi, set **Site Settings** site URL to the public site.
Name and logo stay in **Page → Home → Header**. Title, description and social
image stay in **Home → SEO**.

## 3. Content

1. Stop the source Strapi.
2. From `apps/cms`, export a private archive. Do not commit it. It may contain inquiries, so keep the file and its key outside Git:

```bash
npm run strapi -- export --file ./exports/bott-content
```

3. Back up the destination database before import. Import replaces destination data.
4. Import into the Railway Strapi. On a SQLite destination, copy `inquiries`, admin users and API token tables back from the pre-import backup, as described in the handoff guide. On Railway Postgres, restore those tables from the database backup instead.
5. Confirm Page `home`: draft and published, Header, Hero, eight middle blocks, Footer, collections, palettes, Site Settings, and that media URLs open from the bucket.

The committed `handoff/` archive stays unused.

## 4. Preview, refresh and mail

- Strapi preview opens `/api/preview?secret=…&path=/{locale}` or `/{locale}/news`.
- Webhook **Website content refresh**: `https://PUBLIC_SITE/api/revalidate`, header `x-revalidation-secret` equal to `REVALIDATION_SECRET`, events publish, unpublish, update and delete. Replace the local webhook URL. Do not copy the local secret.
- Public pages revalidate after 60 seconds. The webhook marks them stale. Draft preview is uncached.
- Inquiry email stays off until a real sender and recipient exist. Then set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `INQUIRY_NOTIFICATION_TO` and `INQUIRY_NOTIFICATIONS_ENABLED=true`. A failed send still keeps the saved inquiry. The visitor does not get an automatic reply.

## 5. Launch checks

- Web: `npm run lint`, `npm test`, `npm run typecheck`, `npm run build -- --webpack`.
- CMS: `npm test`, `npx tsc --noEmit`, `npx tsc -p src/admin/tsconfig.json --noEmit`, `npm run build`.
- On the live URLs: home in English, `/` language redirect, gallery images from the bucket, contact form stored as an Inquiry, preview banner and exit, publish then refresh, mobile layout, keyboard and reduced motion.
- Replace the sample phone, commission availability, copyright year and placeholder testimonials before launch.
- Re-test the Strapi 5.53 admin editor aliases when upgrading Strapi.

Provisioning the Railway project, the bucket, the domain and SMTP is still to do.
CI builds the code. It does not create these services.
