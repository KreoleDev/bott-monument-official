import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./load-ts.mjs";
const env = { STRAPI_URL: "http://cms", STRAPI_API_TOKEN: "test" };
test("missing configuration does not throw and rejects unsupported media URLs", async () => {
  const api = loadTs("../src/lib/strapi.ts");
  assert.equal(await api.getHomepageSection("hero"), null);
  assert.equal(api.getStrapiMediaUrl({ url: "/uploads/photo.jpg" }), null);
  assert.equal(api.getStrapiMediaUrl({ url: "javascript:alert(1)" }), null);
  assert.equal(
    api.getStrapiMediaUrl({ url: "https://cdn.example/photo.jpg" }),
    "https://cdn.example/photo.jpg",
  );
});
test("outage retains successful data but editorial deletion clears it", async () => {
  let mode = "success";
  const api = loadTs("../src/lib/strapi.ts", {
    env,
    fetch: async () => {
      if (mode === "offline") throw new Error("offline");
      return {
        ok: true,
        json: async () => ({
          data: {
            homepageSections:
              mode === "empty" ? [] : [{ sectionKey: "hero", title: "Saved title" }],
          },
        }),
      };
    },
  });
  assert.equal((await api.getHomepageSection("hero")).title, "Saved title");
  mode = "offline";
  assert.equal((await api.getHomepageSection("hero")).title, "Saved title");
  mode = "empty";
  assert.equal(await api.getHomepageSection("hero"), null);
  mode = "offline";
  assert.equal(await api.getHomepageSection("hero"), null);
});
test("draft data never enters published fallback cache", async () => {
  let offline = false;
  const api = loadTs("../src/lib/strapi.ts", {
    env,
    fetch: async (_url, options) => {
      if (offline) throw new Error("offline");
      const draft = JSON.parse(options.body).query.includes("DRAFT");
      return {
        ok: true,
        json: async () => ({
          data: {
            homepageSections: [{ sectionKey: "hero", title: draft ? "Secret draft" : "Public" }],
          },
        }),
      };
    },
  });
  assert.equal((await api.getHomepageSection("hero")).title, "Public");
  assert.equal((await api.getHomepageSection("hero", true)).title, "Secret draft");
  offline = true;
  assert.equal(await api.getHomepageSection("hero", true), null);
  assert.equal((await api.getHomepageSection("hero")).title, "Public");
});
test("failed later collection page keeps complete prior result", async () => {
  let fail = false;
  const api = loadTs("../src/lib/strapi-collection.ts", {
    env,
    fetch: async (_url, options) => {
      const page = JSON.parse(options.body).variables.page;
      if (fail && page === 2) throw new Error("offline");
      return {
        ok: true,
        json: async () => ({
          data: {
            galleryItems_connection: {
              nodes: [{ documentId: String(page) }],
              pageInfo: { pageCount: 2 },
            },
          },
        }),
      };
    },
  });
  assert.equal((await api.getCollection("galleryItems_connection", "documentId", [])).length, 2);
  fail = true;
  assert.equal((await api.getCollection("galleryItems_connection", "documentId", [])).length, 2);
});
