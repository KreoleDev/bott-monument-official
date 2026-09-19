import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
require("dotenv").config({ path: path.join(root, ".env"), quiet: true });
if (process.env.DATABASE_CLIENT && process.env.DATABASE_CLIENT !== "sqlite")
  throw new Error("This migration is for local SQLite. Stop Strapi before running it.");
const Database = require("better-sqlite3");
const db = new Database(path.resolve(root, process.env.DATABASE_FILENAME || ".tmp/data.db"), {
  fileMustExist: true,
});
try {
  const backupDir = path.join(root, "exports", `before-header-rules-${Date.now()}`);
  await mkdir(backupDir, { recursive: true });
  await db.backup(path.join(backupDir, "data.db"));
  db.transaction(() => {
    // A single component already uses the same component/link tables as a list.
    db.prepare(
      "UPDATE components_theme_header_scroll SET section='gallery' WHERE section='magazine'",
    ).run();
    db.prepare(
      `UPDATE color_palettes_cmps SET "order"=1 WHERE field='headerScroll' AND "order" IS NULL`,
    ).run();
    db.prepare(
      "UPDATE components_navigation_links SET href='#gallery' WHERE href='#magazine'",
    ).run();
  })();
  console.log(`Header rules preserved, gallery names updated. SQLite backup: ${backupDir}`);
} finally {
  db.close();
}
