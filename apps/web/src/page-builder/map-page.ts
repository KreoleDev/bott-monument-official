import type { PageBlock } from "../lib/pages";
import type { SectionContent } from "../lib/strapi";
import { mapSections } from "./map-sections";
import type { PageExtras } from "./types";

const BLOCK_KEYS: Record<string, string> = {
  ComponentPagesMarquee: "marquee",
  ComponentPagesFounder: "founder",
  ComponentPagesNews: "news",
  ComponentPagesFeaturedIn: "featured-in",
  ComponentPagesGallery: "gallery",
  ComponentPagesShowroom: "showroom",
  ComponentPagesTestimonials: "testimonials",
  ComponentPagesContact: "contact",
};

export function mapPageContent(blocks: PageBlock[], extras: PageExtras) {
  return blocks.flatMap((block) => {
    if (!Object.hasOwn(BLOCK_KEYS, block.__typename)) return [];
    const sectionKey = BLOCK_KEYS[block.__typename];
    const section = {
      ...block,
      sectionKey,
      ...(sectionKey === "marquee"
        ? { title: (block.items || []).map((item) => item.label).join("|") }
        : {}),
    } as SectionContent;
    const selected = { ...extras };
    for (const relation of ["comments", "features", "galleryItems", "pressItems"] as const) {
      const nodes = block[`${relation}_connection`]?.nodes;
      if (nodes?.length) {
        const ids = new Set(nodes.map((item) => item.documentId));
        // Retain the collection's editorial sort order and current publication status.
        Object.assign(selected, {
          [relation]: extras[relation].filter((item) => ids.has(item.documentId)),
        });
      }
    }
    return mapSections([section], selected).map((fragment) => ({
      ...fragment,
      key: `${block.__typename}:${block.id}`,
    }));
  });
}
