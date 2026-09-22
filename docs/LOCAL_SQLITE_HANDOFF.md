# Copy CMS content between local databases

Current status: **2026-09-22**. The shared checklist is
[IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md).

Git delivers code and schemas. It does not update a teammate's database.
Local SQLite files, working uploads and backups stay out of Git. The two files
in `handoff/` are the only versioned content export:

- `handoff/bott-content.tar.gz.enc` — content, components, relations, drafts, published entries, palettes and media. No project code. Inquiries are excluded.
- `handoff/bott-content-key.txt` — decryption key for that archive.

This repository is public, and the key is versioned with the archive, so the
snapshot is public too. Confirm every export contains only content that may be
public before committing it.

## Do not import the current archive

The committed archive is from before Page. Homepage Section has been removed
from the schema. Importing that archive into this version is not supported.

There is also no script that copies Homepage Section into Page. The old
`migrate:home-page` and `migrate:fixed-page-fields` commands were removed after
the original local copy. A database that still has `homepage_sections` must be
backed up before Strapi starts. Startup applies the current schema and drops
that collection.

A blank database needs a new Page `home`, or a future snapshot that has been
restore-tested against this schema.

On 2026-09-22 one development PostgreSQL database was filled from its own
pre-sync backup. That database is not in Git and is not this archive.

## Next snapshot — exported, not committed

On 2026-09-22 the local PostgreSQL database was exported, with Strapi stopped, to
`apps/cms/exports/page-snapshot-20260922.tar.gz.enc`. That file is gitignored.
It contains 2 Page `home` rows (draft and published), the eight middle blocks
in order, the item collections, palettes, site settings, 26 media records and
120 files. Inquiries and user accounts were excluded. It has not replaced
`handoff/` and it has not been committed.

The same file was imported into an empty SQLite database created with this
schema. Page `home`, both publication states and the eight middle blocks arrived.
`strapi import` deletes the destination database first. A private inquiry was
removed by that delete and returned when its table was copied back from a
backup taken before the import. Page content stayed in place.

On an existing SQLite database, stop Strapi, copy `.tmp/data.db`, import, then
copy these tables back from that copy: `inquiries`, `admin_users`,
`admin_users_roles_lnk`, `strapi_api_tokens`, `strapi_api_token_permissions`,
`strapi_api_token_permissions_token_lnk`, `strapi_api_tokens_admin_user_owner_lnk`
and `admin_permissions_api_token_lnk`. Confirm Home and those private rows
before starting Strapi again.

The export is public editorial content. It includes the sample phone
`(307) 000-0000` and placeholder testimonials. It includes no inquiry records.
It has not replaced `handoff/`.

Stop Strapi, then from `apps/cms`:

```bash
npm run strapi -- export --only content,files --exclude-content-types api::inquiry.inquiry,plugin::users-permissions.user --file ../../handoff/bott-content --key "$(cat ../../handoff/bott-content-key.txt)"
```

Before committing a replacement of `handoff/`, repeat the SQLite restore above
and review the public content. Keep the destination `.env`. If a later content
type is private, exclude it from the export and add its tables to the copy-back
list.

## Header color rules

`npm --prefix apps/cms run migrate:header-rules` is only for a stopped SQLite
database that already has header-scroll and navigation tables. It backs up the
file under `apps/cms/exports/`, keeps existing colors, sets list order, and
renames `magazine` to `gallery` in rules and menu links. It does not create
Page, replace the database, or import `handoff/`.

## Archive history

The committed pre-Page snapshot, last checked on 2026-09-17, is a recovery
artifact for the schema that produced it.

| Content | Published entries |
| --- | ---: |
| Homepage Section | 10 |
| Gallery | 13 |
| Features | 7 |
| Press Item | 2 |
| Comments | 9 |
| Color Palettes | 2 |
| Site Settings | 1 |

It also contains drafts, 26 media-library entries and 120 media binaries.
Inquiries and Users & Permissions accounts are excluded. An earlier restore
into a matching schema preserved document IDs, publication states, the selected
palette and media hashes, plus existing inquiries, accounts, tokens and webhook
configuration. That result does not make the archive valid for the current schema.

Primary header scroll in that snapshot is disabled for `work`, with background
`#0A0A0A` and text `#F5F5F0`. Secondary has no explicit rule.

Site Settings in the current schema holds the public URL, social links and
active palette. Home → Header holds the name and logo. Home → SEO holds the
title, description and social image. Copy those values into Home before
starting an older database against the reduced Site Settings schema.
