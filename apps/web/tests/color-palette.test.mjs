import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadTs } from "./load-ts.mjs";
const { paletteStyle, PALETTE_SECTIONS } = loadTs("../src/lib/color-palette.ts");

test("missing or incomplete palettes preserve the design without undefined CSS", () => {
  assert.equal(Object.keys(paletteStyle(null)).length, 0);
  const result = paletteStyle({ name: "New", gallery: { accentColor: "#0044AA" } });
  assert.equal(result["--palette-gallery-accent-color"], "#0044AA");
  assert.equal(result["--palette-gallery-accent-color-rgb"], "0, 68, 170");
  assert.equal(result["--palette-gallery-background"], undefined);
});
test("custom palettes support every section without depending on a palette name", () => {
  const palette = { name: "Forest" };
  for (const section of PALETTE_SECTIONS)
    palette[section] = { backgroundColor: "#113322", textColor: "#FFFFFF", accentColor: "#AA9900" };
  const result = paletteStyle(palette);
  for (const section of PALETTE_SECTIONS) {
    const key = section.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
    assert.equal(result[`--palette-${key}-background`], "#113322");
    assert.equal(result[`--palette-${key}-text-color`], "#FFFFFF");
  }
});
test("gradients preserve stops and valid angles while rejecting CSS injection", () => {
  const result = paletteStyle({
    founder: {
      backgroundColor: "#F6F1E7",
      backgroundMiddleColor: "#E7D3A6",
      backgroundEndColor: "#F6F1E7",
      gradientAngle: 120,
    },
    news: { backgroundColor: "url(https://example.com)", textColor: "#ffffff;display:none" },
    header: { backgroundColor: "#24303D", backgroundEndColor: "#111820", gradientAngle: Infinity },
  });
  assert.equal(
    result["--palette-founder-background"],
    "linear-gradient(120deg, #F6F1E7, #E7D3A6, #F6F1E7)",
  );
  assert.equal(result["--palette-news-background"], undefined);
  assert.equal(result["--palette-news-text-color"], undefined);
  assert.equal(result["--palette-header-background"], "linear-gradient(120deg, #24303D, #111820)");
});
test("published and draft Site Settings load palette colors through the API", async () => {
  const queries = [];
  const { getSiteSettings } = loadTs("../src/lib/site-settings.ts", {
    env: { STRAPI_URL: "http://cms.test", STRAPI_API_TOKEN: "test" },
    fetch: async (_url, init) => {
      queries.push(JSON.parse(init.body).query);
      return {
        ok: true,
        json: async () => ({
          data: {
            siteSetting: {
              activePalette: { name: "Secondary", founder: { backgroundColor: "#FFFFFF" } },
            },
          },
        }),
      };
    },
  });
  assert.equal((await getSiteSettings()).activePalette.name, "Secondary");
  await getSiteSettings(true);
  assert.match(queries[0], /status:PUBLISHED/);
  assert.match(queries[1], /status:DRAFT/);
  assert.match(queries[0], /activePalette/);
});
test("palette background overrides old section colors; testimonial fade follows the palette", () => {
  const global = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  assert.match(global, /var\(--palette-founder-background, var\(--section-founder-background,/);
  const tests = readFileSync(
    new URL("../src/components/testimonials.css", import.meta.url),
    "utf8",
  );
  assert.match(tests, /rgba\(var\(--palette-testimonials-background-color-rgb,/);
});

test("fresh palette reads see consecutive selections even in production", async () => {
  let selected = "Primary";
  const { getFreshPalette } = loadTs("../src/lib/active-palette.ts", {
    env: { NODE_ENV: "production", STRAPI_URL: "http://cms.test", STRAPI_API_TOKEN: "test" },
    fetch: async () => ({
      ok: true,
      json: async () => ({
        data: {
          siteSetting: {
            activePalette: {
              name: selected,
              founder: { backgroundColor: selected === "Primary" ? "#F6F1E7" : "#FFFFFF" },
            },
          },
        },
      }),
    }),
  });
  assert.equal((await getFreshPalette()).name, "Primary");
  selected = "Secondary";
  const next = await getFreshPalette();
  assert.equal(next.name, "Secondary");
  assert.equal(next.style["--palette-founder-background"], "#FFFFFF");
});

test("switching palettes removes stale gradient variables without replacing unrelated body styles", () => {
  const { applyPalette } = loadTs("../src/lib/apply-palette.ts");
  const values = new Map([
    ["--palette-founder-background", "linear-gradient(120deg, #F6F1E7, #E7D3A6)"],
    ["--palette-founder-background-end-color", "#E7D3A6"],
    ["overflow", "hidden"],
    ["--font-display", "Georgia"],
  ]);
  const body = {
    dataset: { siteMode: "primary", colorPalette: "Primary" },
    style: {
      [Symbol.iterator]: () => values.keys(),
      removeProperty: (key) => values.delete(key),
      setProperty: (key, value) => values.set(key, value),
    },
  };
  applyPalette(body, { name: "Secondary", style: { "--palette-founder-background": "#FFFFFF" } });
  assert.equal(body.dataset.colorPalette, "Secondary");
  assert.equal(body.dataset.siteMode, "primary");
  assert.equal(values.get("--palette-founder-background"), "#FFFFFF");
  assert.equal(values.has("--palette-founder-background-end-color"), false);
  assert.equal(values.get("overflow"), "hidden");
  assert.equal(values.get("--font-display"), "Georgia");
  applyPalette(body, { name: "Primary", style: {} });
  assert.equal(values.has("--palette-founder-background"), false);
});

test("new Secondary palettes include the local design’s black gallery", async () => {
  const { seedColorPalettes } = loadTs("../../cms/src/seeds/color-palettes.ts");
  const created = [];
  const documents = {
    findFirst: async () => null,
    create: async ({ data }) => {
      created.push(data);
      return { ...data, documentId: data.name };
    },
  };
  await seedColorPalettes({ documents: () => documents });
  assert.equal(created.find((p) => p.name === "Secondary").gallery.backgroundColor, "#0A0A0A");
  assert.equal(created.find((p) => p.name === "Primary").gallery.backgroundColor, "#2C3A46");
});
