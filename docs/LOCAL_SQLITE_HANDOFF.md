# Migrate CMS data into a teammate's existing SQLite installation

The team receives these two files with `git pull` on `dev`:

- `handoff/bott-content.tar.gz.enc` — Strapi content, components, relations, drafts,
  published entries, palettes and uploaded media. This contains no project code.
- `handoff/bott-content-key.txt` — the decryption key used by the import command.

This repository is public. The archive and its key are intentionally versioned
together, so the snapshot is public too. Inquiry records are excluded.

Pull the matching code and content schemas before importing. Keep the existing
`.env`, SQLite configuration, admin accounts and API tokens. No new project folder,
PostgreSQL setup or new environment files are needed.

## Current status — 2026-09-18

Homepage Section has been removed from the current schema and the local database.
Home now uses Page with fixed Header/Hero/Footer and eight middle blocks.

**Do not import the committed pre-Page archive into this version.** A new Page-based
export and a validated SQLite restore are still pending. The old migration commands
have been removed after completing the local copy. Teammates with legacy data must keep a backup and arrange a verified migration
or compatible handoff before starting this schema-removal version. No migration
from the retired collection is provided by the current code.
Keep SQLite backups, `.env`, accounts, API tokens and inquiries intact.

## Historical snapshot (pre-Page; not a current import source)

| Content | Published entries |
| --- | ---: |
| Homepage Section | 10 |
| Gallery | 13 |
| Features | 7 |
| Press Item | 2 |
| Comments | 9 |
| Color Palettes | 2 |
| Site Settings | 1 |

Draft versions are also included; inquiry records are excluded. There are 26 media library
entries and 120 media binaries, including generated image sizes. The selected
palette is Primary.

The previous public archive was restored successfully into a separate copy of an existing
SQLite installation using the then-matching CMS schema: 130 entities,
197 links and 120 media files. Document IDs, publication states, component counts,
the selected palette and all media hashes matched. Existing inquiries, admin
accounts, API tokens/permissions and webhook configuration were preserved.

## Next handoff — not yet completed

Stop the sender's Strapi server, then from `apps/cms` run:

```bash
npm run strapi -- export --only content,files --exclude-content-types api::inquiry.inquiry,plugin::users-permissions.user --file ../../handoff/bott-content --key "$(cat ../../handoff/bott-content-key.txt)"
```

Before committing, restore the new export into an isolated copy of an existing
SQLite installation with this schema. Compare Page drafts/published content,
Header/Hero/Footer, block order, selections, media hashes and counts. Verify
private inquiries, user accounts, API tokens and local configuration are preserved.
Only after that succeeds, document the tested import command and commit the
public-content-reviewed archive alongside its schema. Teammates pull and run the import
command documented with the refreshed snapshot after validation. Local backups, raw SQLite databases and environment secrets remain
outside Git. If new private content types are added later, exclude them too.

## Snapshot updated on 2026-09-17

The historical export includes the Header Scroll component. Primary has the rule
disabled for `work`, with background `#0A0A0A` and text `#F5F5F0`. Secondary
has no explicit rule and uses the frontend fallback. The archive was decrypted
and its entity types and content were checked against the previous public
snapshot. It contains 130 entities, 197 links and 120 media files; inquiries and
Users & Permissions user accounts are excluded. The restore validation above
refers to the previous snapshot, not a fresh import of this update.

## Branding and SEO ownership

Site Settings now contains only public URL, social links and active palette.
Home → Header owns the name/logo, and Home → SEO owns metadata/social image.
Before upgrading an older database, back it up and copy any missing branding/SEO
into the matching Home draft and published versions before starting Strapi with
the reduced schema. Preserve existing Home values and media files. The local
database was verified and backed up before removing duplicate settings.

## Header rules update (2026-09-19)

After pulling this update, stop Strapi and run from the repository root:

```bash
npm --prefix apps/cms run migrate:header-rules
```

This idempotent SQLite migration creates a backup in `apps/cms/exports/`, preserves
existing Primary/Secondary header rules, initializes their list order and renames
`magazine` to `gallery` in rules and navigation. Then restart Strapi. It does not
replace the database, change the active palette or import the old handoff archive.
