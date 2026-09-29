import { getComments } from "@/lib/comments";
import { getFeatures } from "@/lib/features";
import { getGalleryItems } from "@/lib/gallery";
import { getPressItems } from "@/lib/news";
import { getSiteSettings } from "@/lib/site-settings";
import { getStrapiMediaUrl, type SectionContent } from "@/lib/strapi";
import { getHomePage } from "@/lib/pages";
import { mapPageContent } from "./map-page";

import type { PageExtras } from "./types";
import { DEFAULT_LOCALE } from "@/lib/locale";

export type GetPageOptions = {
  preview?: boolean;
  locale?: string;
};

export async function getPage({ preview = false, locale = DEFAULT_LOCALE }: GetPageOptions = {}) {
  const [home, comments, galleryItems, features, pressItems, settings] = await Promise.all([
    getHomePage(preview, locale),
    getComments(preview, locale),
    getGalleryItems(preview, locale),
    getFeatures(preview, locale),
    getPressItems(preview, locale),
    getSiteSettings(preview),
  ]);

  const extras: PageExtras = {
    locale,
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
      locale,
      logo: getStrapiMediaUrl(home?.header?.logo),
      siteName: home?.header?.siteName || undefined,
      links: home?.header?.links,
    },
    settings,
    hasSections: Boolean(home?.hero || home?.content.length),
  };
}
