import { PALETTE_FIELDS, type ColorPalette } from "./color-palette";
import { cmsRead, cmsQuery } from "./cms-cache";
import type { StrapiMedia } from "./strapi";
export type SiteSettings = {
  activePalette: ColorPalette | null;
  siteName: string | null;
  siteUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  logo: StrapiMedia | null;
  socialImage: StrapiMedia | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
};
export function getSiteSettings(preview = false): Promise<SiteSettings | null> {
  return cmsRead(
    "site-settings",
    async () => {
      const data = await cmsQuery<{ siteSetting: SiteSettings | null }>(
        `query SiteSettings { siteSetting(status:${preview ? "DRAFT" : "PUBLISHED"}) { siteName siteUrl seoTitle seoDescription logo { url alternativeText } socialImage { url alternativeText } facebookUrl instagramUrl activePalette { ${PALETTE_FIELDS} } } }`,
        {},
        preview,
      );
      return data.siteSetting;
    },
    null,
    preview,
  );
}
