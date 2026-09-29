import { cmsQuery } from "./cms-cache";
import {
  PALETTE_FIELDS,
  paletteStyle,
  headerScrollRules,
  type ColorPalette,
} from "./color-palette";

export type PaletteSnapshot = {
  name: string;
  style: Record<string, string>;
  headerScroll: ReturnType<typeof headerScrollRules>;
};

// This small read deliberately bypasses the page cache. A tab may retain its root
// layout after navigation even when the CMS webhook has invalidated server data.
export async function getFreshPalette(preview = false): Promise<PaletteSnapshot> {
  const data = await cmsQuery<{ siteSetting: { activePalette: ColorPalette | null } | null }>(
    `query ActivePalette { siteSetting(status:${preview ? "DRAFT" : "PUBLISHED"}) { activePalette { ${PALETTE_FIELDS} } } }`,
    {},
    preview,
  );
  const palette = data.siteSetting?.activePalette;
  return {
    headerScroll: headerScrollRules(palette?.headerScroll),
    name: palette?.name || "Primary",
    style: paletteStyle(palette) as Record<string, string>,
  };
}
