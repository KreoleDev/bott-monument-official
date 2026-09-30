import { PALETTE_FIELDS, type ColorPalette } from "./color-palette";
import { cmsRead, cmsQuery } from "./cms-cache";
export type SiteSettings = {
  activePalette: ColorPalette | null;
  siteUrl: string | null;
};
export function getSiteSettings(preview = false): Promise<SiteSettings | null> {
  return cmsRead(
    "site-settings",
    async () => {
      const data = await cmsQuery<{ siteSetting: SiteSettings | null }>(
        `query SiteSettings { siteSetting(status:${preview ? "DRAFT" : "PUBLISHED"}) { siteUrl activePalette { ${PALETTE_FIELDS} } } }`,
        {},
        preview,
      );
      return data.siteSetting;
    },
    null,
    preview,
  );
}
