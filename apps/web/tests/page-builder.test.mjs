import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./load-ts.mjs";

const extras = {
  comments: [{ documentId: "c1" }],
  galleryItems: [{ documentId: "g1" }],
  features: [{ documentId: "f1" }],
  pressItems: [{ documentId: "p1" }],
  settings: { facebookUrl: "https://www.facebook.com/example" },
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
  assert.equal(mapFooterChrome(sections, extras).settings.facebookUrl, "https://www.facebook.com/example");
  assert.equal(mapFooterChrome([{ sectionKey: "hero" }], extras), null);
});

test("Page blocks preserve order, repeated block identity, labels and selected items", () => {
  const { mapPageContent } = loadTs("../src/page-builder/map-page.ts");
  const content = mapPageContent(
    [
      {
        __typename: "ComponentPagesNews",
        id: "1",
        title: "First",
        pressItems_connection: { nodes: [{ documentId: "p1" }] },
      },
      {
        __typename: "ComponentPagesMarquee",
        id: "2",
        items: [{ label: "Stone" }, { label: "Legacy" }],
      },
      { __typename: "ComponentPagesNews", id: "3", pressItems_connection: { nodes: [] } },
      { __typename: "ComponentPagesFooter", id: "4" },
    ],
    { ...extras, pressItems: [{ documentId: "p2" }, { documentId: "p1" }] },
  );
  assert.deepEqual(
    content.map((x) => x.fragmentName),
    ["news", "marquee", "news"],
  );
  assert.notEqual(content[0].key, content[2].key);
  assert.equal(content[1].payload.section.title, "Stone|Legacy");
  assert.deepEqual(
    content[0].payload.items.map((x) => x.documentId),
    ["p1"],
  );
  assert.equal(content[2].payload.items.length, 2);
});

test("a selection of unavailable items does not show unrelated collection entries", () => {
  const { mapPageContent } = loadTs("../src/page-builder/map-page.ts");
  const result = mapPageContent(
    [
      {
        __typename: "ComponentPagesTestimonials",
        id: "1",
        comments_connection: { nodes: [{ documentId: "unpublished" }] },
      },
    ],
    extras,
  );
  assert.equal(result[0].payload.comments.length, 0);
});

test("Page reads paginate selections, isolate preview and honor an intentionally empty page", async () => {
  const calls = [];
  let empty = false;
  const { getHomePage } = loadTs("../src/lib/pages.ts", {
    env: { STRAPI_URL: "http://cms", STRAPI_API_TOKEN: "public", STRAPI_PREVIEW_TOKEN: "preview" },
    fetch: async (_url, options) => {
      const { variables } = JSON.parse(options.body);
      calls.push({ ...variables, token: options.headers.Authorization });
      return {
        ok: true,
        json: async () => ({
          data: {
            pages: empty
              ? [{ documentId: "home", content: [] }]
              : [
                  {
                    documentId: "home",
                    content: [
                      {
                        id: "1",
                        __typename: "ComponentPagesTestimonials",
                        comments_connection: {
                          nodes: Array.from(
                            { length: variables.relationPage === 1 ? 100 : 1 },
                            (_, i) => ({ documentId: `${variables.relationPage}-${i}` }),
                          ),
                        },
                      },
                    ],
                  },
                ],
          },
        }),
      };
    },
  });
  const page = await getHomePage();
  assert.equal(page.content[0].comments_connection.nodes.length, 101);
  assert.deepEqual(
    calls.map((x) => x.relationPage),
    [1, 2],
  );
  await getHomePage(true);
  assert.equal(calls[2].status, "DRAFT");
  assert.equal(calls[2].token, "Bearer preview");
  assert.equal(calls[0].status, "PUBLISHED");
  empty = true;
  assert.equal((await getHomePage()).content.length, 0);
});
