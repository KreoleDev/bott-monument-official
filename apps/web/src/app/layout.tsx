import { draftMode, headers } from "next/headers";
import { paletteStyle, headerScrollRules, paletteSiteMode } from "@/lib/color-palette";
import { PaletteSync } from "@/components/palette-sync";
import type { Metadata, Viewport } from "next";
import { getHomePage } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site-settings";
import { getStrapiMediaUrl } from "@/lib/strapi";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const preview = (await draftMode()).isEnabled;
  const locale = (await headers()).get("x-site-locale") || "en";
  const [home, settings] = await Promise.all([
    getHomePage(preview, locale),
    getSiteSettings(preview),
  ]);
  const title = home?.seo?.metaTitle || home?.header?.siteName || "Bott Monument";
  const description = home?.seo?.metaDescription || "Custom memorials crafted in stone.";
  const image = getStrapiMediaUrl(home?.seo?.metaImage);
  let metadataBase: URL | undefined;
  try {
    if (settings?.siteUrl && /^https?:\/\//.test(settings.siteUrl))
      metadataBase = new URL(settings.siteUrl);
  } catch {
    /* Invalid editorial URL must not break rendering. */
  }
  return {
    title: { default: title, template: `%s | ${home?.header?.siteName || "Bott Monument"}` },
    description,
    metadataBase,
    openGraph: { title, description, ...(image ? { images: [image] } : {}) },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const preview = (await draftMode()).isEnabled;
  const locale = (await headers()).get("x-site-locale") || "en";
  const settings = await getSiteSettings(preview);
  const paletteName = settings?.activePalette?.name || "Primary";
  return (
    <html
      lang={locale}
      className="h-full antialiased"
    >
      <body
        className="min-h-full flex flex-col"
        data-site-mode={paletteSiteMode(paletteName)}
        data-header-scroll={JSON.stringify(
          headerScrollRules(settings?.activePalette?.headerScroll),
        )}
        data-color-palette={paletteName}
        style={paletteStyle(settings?.activePalette)}
      >
        {children}
        <PaletteSync preview={preview} />
      </body>
    </html>
  );
}
