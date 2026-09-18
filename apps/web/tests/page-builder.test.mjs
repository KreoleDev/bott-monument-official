import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./load-ts.mjs";

const extras = {
  comments: [{ documentId: "c1" }],
  galleryItems: [{ documentId: "g1" }],
  features: [{ documentId: "f1" }],
  pressItems: [{ documentId: "p1" }],
  settings: { siteName: "Bott Monument" },
};

const motor = () => loadTs("../src/page-builder/map-sections.ts");

test("maps registered sections in CMS order and skips unknown keys", () => {
  const { mapSections } = motor();
  const content = mapSections(
    [
      { sectionKey: "hero", title: "Hero" },
      { sectionKey: "unknown-block", title: "Ignore" },
      { sectionKey: "constructor" },
      { sectionKey: "__proto__" },
      { sectionKey: "news", title: "News" },
      { sectionKey: "footer", title: "Footer" },
    ],
    extras,
  );
  assert.deepEqual(
    content.map((item) => item.fragmentName),
    ["hero", "news"],
  );
  assert.equal(content[1].payload.items, extras.pressItems);
});

test("keeps footer as chrome instead of a main fragment", () => {
  const { mapSections, mapFooterChrome } = motor();
  const sections = [
    { sectionKey: "contact", title: "Contact" },
    { sectionKey: "footer", footer: { brand: "Bott®" } },
  ];
  assert.equal(mapSections(sections, extras).length, 1);
  assert.equal(mapFooterChrome(sections, extras).settings.siteName, "Bott Monument");
  assert.equal(mapFooterChrome([{ sectionKey: "hero" }], extras), null);
});
