import { draftMode, headers } from "next/headers";
import { paletteStyle, headerScrollRules } from "@/lib/color-palette";
import { PaletteSync } from "@/components/palette-sync";
import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Alex_Brush } from "next/font/google";
import { getHomePage } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site-settings";
import { getStrapiMediaUrl } from "@/lib/strapi";
import "./globals.css";
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});
const utility = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
});
const script = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-alex-brush",
});
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
  return (
    <html
      lang={locale}
      className={`h-full antialiased ${display.variable} ${utility.variable} ${script.variable}`}
    >
      <body
        className="min-h-full flex flex-col"
        data-site-mode="primary"
        data-header-scroll={JSON.stringify(
          headerScrollRules(settings?.activePalette?.headerScroll),
        )}
        data-color-palette={settings?.activePalette?.name || "Primary"}
        style={paletteStyle(settings?.activePalette)}
      >
        {children}
        <PaletteSync preview={preview} />
      </body>
    </html>
  );
}
