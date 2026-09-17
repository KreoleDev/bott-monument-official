import { getComments } from "@/lib/comments";
import { getFeatures } from "@/lib/features";
import { getGalleryItems } from "@/lib/gallery";
import { getPressItems } from "@/lib/news";
import { getSiteSettings } from "@/lib/site-settings";
import { getHomepageSections, getStrapiMediaUrl } from "@/lib/strapi";
import { mapFooterChrome, mapSections } from "./map-sections";
import type { PageExtras } from "./types";

export type UsePageOptions = {
  preview?: boolean;
};

export async function usePage({ preview = false }: UsePageOptions = {}) {
  const [sections, comments, galleryItems, features, pressItems, settings] =
    await Promise.all([
      getHomepageSections(preview),
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
    content: mapSections(sections, extras),
    footer: mapFooterChrome(sections, extras),
    header: {
      logo: getStrapiMediaUrl(settings?.logo),
      siteName: settings?.siteName || undefined,
    },
    settings,
    hasSections: sections.length > 0,
  };
}
