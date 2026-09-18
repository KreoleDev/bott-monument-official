import { draftMode } from "next/headers";
import { paletteStyle, headerScrollRule } from "@/lib/color-palette";
import { PaletteSync } from "@/components/palette-sync";
import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Alex_Brush } from "next/font/google";
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
  const settings = await getSiteSettings();
  const title = settings?.seoTitle || "Bott Monument";
  const description = settings?.seoDescription || "Custom memorials crafted in stone.";
  const image = getStrapiMediaUrl(settings?.socialImage);
  let metadataBase: URL | undefined;
  try {
    if (settings?.siteUrl && /^https?:\/\//.test(settings.siteUrl))
      metadataBase = new URL(settings.siteUrl);
  } catch {
    /* Invalid editorial URL must not break rendering. */
  }
  return {
    title: { default: title, template: `%s | ${settings?.siteName || "Bott Monument"}` },
    description,
    metadataBase,
    openGraph: { title, description, ...(image ? { images: [image] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title, description },
  };
}
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const preview = (await draftMode()).isEnabled;
  const settings = await getSiteSettings(preview);
  return (
    <html
      lang="en"
      className={`h-full antialiased ${display.variable} ${utility.variable} ${script.variable}`}
    >
      <body
        className="min-h-full flex flex-col"
        data-site-mode="primary"
        data-header-scroll={JSON.stringify(headerScrollRule(settings?.activePalette?.headerScroll))}
        data-color-palette={settings?.activePalette?.name || "Primary"}
        style={paletteStyle(settings?.activePalette)}
      >
        {children}
        <PaletteSync preview={preview} />
      </body>
    </html>
  );
}
