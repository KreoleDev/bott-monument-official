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

## On their computer

After pulling `dev`, stop the Strapi dev server. From the repository root, install
the locked CMS dependencies and back up the current state, choosing and retaining
a separate backup encryption key when prompted:

```bash
cd apps/cms
npm ci
npm run strapi -- export --file ./exports/before-data-migration
```

Then import the committed data file from that same `apps/cms` directory:

```bash
npm run strapi -- import --file ../../handoff/bott-content.tar.gz.enc --key "$(cat ../../handoff/bott-content-key.txt)" --only content,files --exclude-content-types api::inquiry.inquiry,plugin::users-permissions.user
```

The command reads the key from the committed file. Confirm the import, then restart:

```bash
npm run develop
```

**This replaces the destination's CMS content and uploaded media with the sender's
snapshot. It is not an additive merge.** The CLI asks for confirmation. The
`--exclude-content-types api::inquiry.inquiry,plugin::users-permissions.user` preserves existing local inquiries.
The `--only content,files` filter preserves local application configuration;
source admin accounts, API tokens, environment secrets and webhook configuration
are excluded from the shared export. Keep the backup if they have local content
that they may need to recover.

## What the prepared snapshot contains

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
SQLite installation using the CMS files included in this commit: 130 entities,
197 links and 120 media files. Document IDs, publication states, component counts,
the selected palette and all media hashes matched. Existing inquiries, admin
accounts, API tokens/permissions and webhook configuration were preserved.

## Export newer data later

Stop the sender's Strapi server, then from `apps/cms` run:

```bash
npm run strapi -- export --only content,files --exclude-content-types api::inquiry.inquiry,plugin::users-permissions.user --file ../../handoff/bott-content --key "$(cat ../../handoff/bott-content-key.txt)"
```

Review the export for content suitable for the public repository, then commit the
updated archive alongside any schema changes. Teammates pull and run the import
command above. Local backups, raw SQLite databases and environment secrets remain
outside Git. If new private content types are added later, exclude them too.

## Snapshot updated on 2026-09-17

The current export includes the Header Scroll component. Primary has the rule
disabled for `work`, with background `#0A0A0A` and text `#F5F5F0`. Secondary
has no explicit rule and uses the frontend fallback. The archive was decrypted
and its entity types and content were checked against the previous public
snapshot. It contains 130 entities, 197 links and 120 media files; inquiries and
Users & Permissions user accounts are excluded. The restore validation above
refers to the previous snapshot, not a fresh import of this update.
