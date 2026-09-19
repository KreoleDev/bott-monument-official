import { getComments } from "@/lib/comments";
import { getFeatures } from "@/lib/features";
import { getGalleryItems } from "@/lib/gallery";
import { getPressItems } from "@/lib/news";
import { getSiteSettings } from "@/lib/site-settings";
import { getStrapiMediaUrl, type SectionContent } from "@/lib/strapi";
import { getHomePage } from "@/lib/pages";
import { mapPageContent } from "./map-page";

import type { PageExtras } from "./types";

export type GetPageOptions = {
  preview?: boolean;
};

export async function getPage({ preview = false }: GetPageOptions = {}) {
  const [home, comments, galleryItems, features, pressItems, settings] = await Promise.all([
    getHomePage(preview),
    getComments(preview),
    getGalleryItems(preview),
    getFeatures(preview),
    getPressItems(preview),
    getSiteSettings(preview),
  ]);

  const extras: PageExtras = {
    comments,
    galleryItems,
    features,
    pressItems,
    settings,
  };

  return {
    content: mapPageContent(home?.content || [], extras),
    hero: home?.hero ? ({ ...home.hero, sectionKey: "hero" } as SectionContent) : null,
    footer: home?.footer
      ? { section: { sectionKey: "footer", footer: home.footer } as SectionContent, settings }
      : null,
    header: {
      logo: getStrapiMediaUrl(home?.header?.logo),
      siteName: home?.header?.siteName || undefined,
      links: home?.header?.links,
    },
    settings,
    hasSections: Boolean(home?.hero || home?.content.length),
  };
}
