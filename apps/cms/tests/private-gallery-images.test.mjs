import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { mkdtemp, mkdir, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import vm from "node:vm";
import sharp from "sharp";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(relativePath, overrides = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL(relativePath, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, {
    module,
    exports: module.exports,
    require,
    process,
    ...overrides,
  });
  return module.exports;
}
const variants = load("../src/api/private-gallery/utils/photo-variants.ts");

test("private renditions reduce transfer size, reuse disk output, and keep access checks", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "bott-gallery-images-"));
  try {
    const uploads = path.join(directory, ".private-gallery-uploads");
    await mkdir(uploads);
    const id = "12345678-1234-1234-1234-123456789012";
    const original = path.join(uploads, `${id}.png`);
    await sharp({ create: { width: 2400, height: 1800, channels: 3, background: "#a99887" } })
      .png()
      .toFile(original);
    const [first, concurrent] = await Promise.all([
      variants.getPhotoVariant(original, 480),
      variants.getPhotoVariant(original, 480),
    ]);
    assert.equal(first, concurrent);
    const metadata = await sharp(first).metadata();
    assert.equal(metadata.width, 480);
    assert.equal(metadata.height, 360);
    assert.equal(metadata.format, "webp");
    assert.ok((await stat(first)).size < (await stat(original)).size / 5);
    const modified = (await stat(first)).mtimeMs;
    assert.equal(await variants.getPhotoVariant(original, 480), first);
    assert.equal((await stat(first)).mtimeMs, modified);
    assert.equal(variants.getPhotoWidth("480"), 480);
    assert.equal(variants.getPhotoWidth("100000"), null);
    await assert.rejects(() => variants.getPhotoVariant(original, 100000));

    let approved = true;
    let published = true;
    const email = "approved@example.com";
    const controller = load("../src/api/private-gallery/controllers/private-gallery.ts", {
      process: { cwd: () => directory, env: {} },
      require: (name) => (name === "../utils/photo-variants" ? variants : require(name)),
      strapi: {
        db: { query: () => ({ findOne: async () => (approved ? { email } : null) }) },
        documents: () => ({
          findMany: async () => (published ? [{ photos: [{ id, name: "photo.png" }] }] : []),
        }),
      },
    }).default;
    const request = () => ({
      request: {},
      params: { id },
      query: { email, width: "480" },
      headers: {},
      set(name, value) {
        this.headers[name] = value;
      },
    });
    const ctx = request();
    await controller.photo(ctx);
    const chunks = [];
    for await (const chunk of ctx.body) chunks.push(chunk);
    assert.deepEqual(Buffer.concat(chunks), await readFile(first));
    assert.equal(ctx.headers["Content-Type"], "image/webp");
    assert.equal(ctx.headers["Cache-Control"], "private, no-store");
    approved = false;
    const revoked = request();
    await controller.photo(revoked);
    assert.equal(revoked.status, 404);
    approved = true;
    published = false;
    const unpublished = request();
    await controller.photo(unpublished);
    assert.equal(unpublished.status, 404);
    const invalid = request();
    invalid.query.width = "100000";
    await controller.photo(invalid);
    assert.equal(invalid.status, 400);

    await sharp({ create: { width: 100, height: 200, channels: 3, background: "#998877" } })
      .png()
      .toFile(original);
    const replaced = await variants.getPhotoVariant(original, 480);
    assert.notEqual(replaced, first);
    assert.equal((await sharp(replaced).metadata()).width, 100);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
