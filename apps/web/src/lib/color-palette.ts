import type { CSSProperties } from "react";

export const PALETTE_SECTIONS = [
  "header",
  "hero",
  "marquee",
  "founder",
  "news",
  "featuredIn",
  "gallery",
  "showroom",
  "testimonials",
  "contact",
  "footer",
] as const;
const COLOR_FIELDS = [
  "backgroundColor",
  "backgroundMiddleColor",
  "backgroundEndColor",
  "textColor",
  "mutedTextColor",
  "accentColor",
  "surfaceColor",
  "surfaceTextColor",
  "borderColor",
  "buttonColor",
  "buttonTextColor",
  "overlayColor",
  "avatarColor",
] as const;
type ColorField = (typeof COLOR_FIELDS)[number];
export type SectionColors = Partial<Record<ColorField, string | null>> & {
  gradientAngle?: number | null;
};
export type ColorPalette = { documentId: string; name: string } & Partial<
  Record<(typeof PALETTE_SECTIONS)[number], SectionColors | null>
>;
export const PALETTE_FIELDS = `documentId name ${PALETTE_SECTIONS.map((section) => `${section} { ${COLOR_FIELDS.join(" ")} gradientAngle }`).join(" ")}`;
const validColor = (value: unknown): value is string =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
const cssName = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

// Emit only known variables and hex colors: CMS content cannot inject CSS or URLs.
// Missing palettes/fields leave all existing design colors and section overrides intact.
export function paletteStyle(palette: ColorPalette | null | undefined): CSSProperties {
  const style: Record<string, string> = {};
  for (const section of PALETTE_SECTIONS) {
    const colors = palette?.[section];
    if (!colors) continue;
    const prefix = `--palette-${cssName(section)}`;
    for (const field of COLOR_FIELDS) {
      const value = colors[field];
      if (validColor(value)) {
        const variable = `${prefix}-${cssName(field)}`;
        style[variable] = value;
        style[`${variable}-rgb`] = [1, 3, 5]
          .map((offset) => parseInt(value.slice(offset, offset + 2), 16))
          .join(", ");
      }
    }
    if (validColor(colors.backgroundColor)) {
      const stops = [
        colors.backgroundColor,
        colors.backgroundMiddleColor,
        colors.backgroundEndColor,
      ].filter(validColor);
      const angle =
        typeof colors.gradientAngle === "number" && Number.isFinite(colors.gradientAngle)
          ? Math.min(360, Math.max(0, colors.gradientAngle))
          : 120;
      style[`${prefix}-background`] =
        stops.length > 1
          ? `linear-gradient(${angle}deg, ${stops.join(", ")})`
          : colors.backgroundColor;
    }
  }
  return style as CSSProperties;
}
