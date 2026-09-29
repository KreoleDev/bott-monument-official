import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const cmsDir = fileURLToPath(new URL("../", import.meta.url));
const originalCwd = process.cwd();
const originalEnv = { ...process.env };
let directory;
let app;

before(
  async () => {
    directory = await mkdtemp(path.join(tmpdir(), "bott-page-model-"));
    for (const name of ["config", "src", "types", "package.json", "tsconfig.json"]) {
      await cp(path.join(cmsDir, name), path.join(directory, name), { recursive: true });
    }
    await mkdir(path.join(directory, "public/uploads"), { recursive: true });
    await symlink(path.join(cmsDir, "node_modules"), path.join(directory, "node_modules"), "dir");
    const secret = () => randomBytes(32).toString("hex");
    // Never load the real .env, database or uploads, and never send notifications.
    const env = {
      NODE_ENV: "test",
      DATABASE_CLIENT: "sqlite",
      DATABASE_FILENAME: ".tmp/test.db",
      APP_KEYS: `${secret()},${secret()}`,
      API_TOKEN_SALT: secret(),
      ADMIN_JWT_SECRET: secret(),
      TRANSFER_TOKEN_SALT: secret(),
      JWT_SECRET: secret(),
      ENCRYPTION_KEY: secret(),
      SMTP_HOST: "",
      S3_BUCKET: "",
      PREVIEW_SECRET: "",
      INQUIRY_NOTIFICATIONS_ENABLED: "false",
      STRAPI_TELEMETRY_DISABLED: "true",
    };
    Object.assign(process.env, env);
    await writeFile(path.join(directory, ".env"), "", { mode: 0o600 });
    process.chdir(directory);
    const { compileStrapi, createStrapi } = require("@strapi/strapi");
    app = createStrapi(await compileStrapi({ appDir: directory }));
    await app.load();
  },
  { timeout: 120000 },
);

after(async () => {
  if (app) await app.destroy();
  process.chdir(originalCwd);
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) delete process.env[key];
  }
  Object.assign(process.env, originalEnv);
  if (directory) await rm(directory, { recursive: true, force: true });
});

const populate = { hero: true, footer: true, content: { populate: "*" }, seo: { populate: "*" } };

test("Page preserves typed block order, nested content, and separate drafts", async () => {
  const pages = app.documents("api::page.page");
  const page = await pages.create({
    data: {
      slug: "home",
      title: "Home",
      hero: { title: "Crafted to stand forever." },
      footer: { brand: "Bott Monument" },
      seo: { metaTitle: "Bott Monument", metaDescription: "Memorial craftsmanship" },
      content: [
        { __component: "pages.marquee", items: [{ label: "Stone mastery" }, { label: "Legacy" }] },
        { __component: "pages.founder", personName: "Drew Bott", quote: "Personal artistry" },
        { __component: "pages.news", title: "News" },
        { __component: "pages.featured-in", title: "As Featured In" },
        { __component: "pages.gallery", galleryAccess: { title: "Private Gallery" } },
        { __component: "pages.showroom", showroom: { location: "Wyoming" } },
        { __component: "pages.testimonials", title: "Trusted With" },
        { __component: "pages.contact", contact: { inquiryLabel: "What brings you here?" } },
      ],
    },
  });
  assert.equal(await pages.findFirst({ status: "published", filters: { slug: "home" } }), null);
  await pages.publish({ documentId: page.documentId });
  const published = await pages.findOne({
    documentId: page.documentId,
    status: "published",
    populate,
  });
  assert.deepEqual(
    published.content.map((block) => block.__component),
    [
      "pages.marquee",
      "pages.founder",
      "pages.news",
      "pages.featured-in",
      "pages.gallery",
      "pages.showroom",
      "pages.testimonials",
      "pages.contact",
    ],
  );
  assert.equal(published.content[0].items[1].label, "Legacy");
  assert.equal(published.content[4].galleryAccess.title, "Private Gallery");
  assert.equal(published.seo.metaTitle, "Bott Monument");
  assert.equal(published.hero.title, "Crafted to stand forever.");
  assert.equal(published.footer.brand, "Bott Monument");
  const attributes = app.contentType("api::page.page").attributes;
  assert.equal(attributes.hero.repeatable, false);
  assert.equal(attributes.footer.repeatable, false);
  assert.equal(attributes.content.components.includes("pages.hero"), false);
  assert.equal(attributes.content.components.includes("footer.details"), false);
  await pages.update({
    documentId: page.documentId,
    data: {
      title: "Unpublished edit",
      content: [
        { __component: "pages.contact", title: "Contact first" },
        { __component: "pages.founder", title: "Founder second" },
      ],
    },
  });
  const draft = await pages.findOne({ documentId: page.documentId, status: "draft", populate });
  assert.deepEqual(
    draft.content.map((block) => block.__component),
    ["pages.contact", "pages.founder"],
  );
  const unchanged = await pages.findOne({
    documentId: page.documentId,
    status: "published",
    populate,
  });
  assert.equal(unchanged.title, "Home");
  assert.equal(unchanged.content.length, 8);
  assert.equal(draft.hero.title, published.hero.title);
  assert.equal(draft.footer.brand, published.footer.brand);
  await assert.rejects(
    pages.create({ status: "published", data: { slug: "home", title: "Duplicate" } }),
  );
  await assert.rejects(
    pages.create({ status: "published", data: { slug: "Invalid Slug", title: "Invalid" } }),
  );
});

test("selected press items can be reused; removing a block preserves collection content", async () => {
  const press = await app.documents("api::press-item.press-item").create({
    status: "published",
    data: { title: "Cover Story", source: "MB News", url: "https://example.com/story" },
  });
  const pages = app.documents("api::page.page");
  const data = {
    title: "Press",
    content: [{ __component: "pages.news", pressItems: [press.documentId] }],
  };
  const first = await pages.create({ status: "published", data: { ...data, slug: "first" } });
  const second = await pages.create({ status: "published", data: { ...data, slug: "second" } });
  for (const page of [first, second]) {
    const result = await pages.findOne({
      documentId: page.documentId,
      status: "published",
      populate,
    });
    assert.equal(result.content[0].pressItems[0].documentId, press.documentId);
  }
  await pages.update({ documentId: first.documentId, status: "published", data: { content: [] } });
  const remaining = await pages.findOne({
    documentId: second.documentId,
    status: "published",
    populate,
  });
  assert.equal(remaining.content[0].pressItems[0].documentId, press.documentId);
  assert.ok(
    await app
      .documents("api::press-item.press-item")
      .findOne({ documentId: press.documentId, status: "published" }),
  );
});

test("GraphQL exposes Page blocks as typed fragments and removes the retired collection", async () => {
  const { parse, validate } = require("graphql");
  const schema = app.plugin("graphql").service("content-api").buildSchema();
  const errors = validate(
    schema,
    parse(`query {
    pages(filters: { slug: { eq: "home" } }, status: PUBLISHED, locale: "en") {
      hero { title video { url } } footer { brand }
      slug title seo { metaTitle metaDescription metaImage { url } }
      content {
        __typename
        ... on ComponentPagesMarquee { items { label } }
        ... on ComponentPagesFounder { personName quote }
        ... on ComponentPagesNews { pressItems { documentId title } }
        ... on ComponentPagesFeaturedIn { features { documentId } }
        ... on ComponentPagesGallery { galleryItems { documentId } galleryAccess { title } }
        ... on ComponentPagesShowroom { showroom { location } }
        ... on ComponentPagesTestimonials { comments { documentId quote } }
        ... on ComponentPagesContact { contact { inquiryLabel } }
      }
    }
  }`),
  );
  assert.deepEqual(
    errors.map((error) => error.message),
    [],
  );
  assert.equal(schema.getQueryType().getFields().homepageSections, undefined);
  assert.ok(schema.getType("InquiryInput").getFields().submissionLocale);
  assert.deepEqual(
    validate(schema, parse(`query { siteSetting { activePalette { name } } }`)).map(
      (error) => error.message,
    ),
    [],
    "Site Settings must expose the single activePalette relation used by the frontend",
  );
  const frontendQuerySource = await readFile(
    path.join(cmsDir, "../web/src/lib/page-query.ts"),
    "utf8",
  );
  const frontendQuery = frontendQuerySource.slice(
    frontendQuerySource.indexOf("`") + 1,
    frontendQuerySource.lastIndexOf("`"),
  );
  assert.deepEqual(
    validate(schema, parse(frontendQuery)).map((error) => error.message),
    [],
  );
  assert.equal(
    app.contentType("api::page.page").attributes.slug.pluginOptions.i18n.localized,
    false,
  );
  for (const uid of [
    "api::comment.comment",
    "api::feature.feature",
    "api::gallery-item.gallery-item",
    "api::press-item.press-item",
  ]) {
    assert.equal(app.contentType(uid).pluginOptions.i18n.localized, true);
  }
  assert.deepEqual(
    validate(
      schema,
      parse(`query LocalizedItems($locale: I18NLocaleCode!) {
        comments_connection(locale: $locale) { nodes { documentId quote } }
        features_connection(locale: $locale) { nodes { documentId title } }
        galleryItems_connection(locale: $locale) { nodes { documentId title } }
        pressItems_connection(locale: $locale) { nodes { documentId title } }
      }`),
    ).map((error) => error.message),
    [],
  );
});

test("palettes preserve multiple ordered header rules through draft, publish and GraphQL", async () => {
  const palettes = app.documents("api::color-palette.color-palette");
  const palette = await palettes.create({
    data: {
      name: "Header rules test",
      headerScroll: [
        { section: "gallery", backgroundColor: "#0000FF", textColor: "#FFFFFF" },
        { section: "contact", backgroundColor: "#FFFF00", textColor: "#000000" },
      ],
    },
  });
  await palettes.publish({ documentId: palette.documentId });
  for (const status of ["draft", "published"]) {
    const value = await palettes.findOne({
      documentId: palette.documentId,
      status,
      populate: ["headerScroll"],
    });
    assert.deepEqual(
      value.headerScroll.map((rule) => rule.section),
      ["gallery", "contact"],
    );
  }
  const { parse, validate, getNullableType, isListType } = require("graphql");
  const schema = app.plugin("graphql").service("content-api").buildSchema();
  assert.deepEqual(
    validate(
      schema,
      parse(`query {
    colorPalettes { headerScroll { enabled section backgroundColor textColor } }
  }`),
    ).map((error) => error.message),
    [],
  );
  const type = schema.getType("ColorPalette").getFields().headerScroll.type;
  assert.ok(isListType(getNullableType(type)), "headerScroll is exposed as a GraphQL list");
});
