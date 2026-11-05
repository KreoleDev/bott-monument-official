import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components";
import { isLocaleCode } from "@/lib/locale";
import { getHomeChrome, getPrivateGalleryPage, type PrivateGalleryContent } from "@/lib/pages";
import { getStrapiMediaUrl, type SectionContent } from "@/lib/strapi";
import { PrivateGalleryGate } from "./private-gallery-gate";
import "./private-gallery.css";

export const dynamic = "force-dynamic";

type PrivateGalleryPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

function galleryPageStyle(content: PrivateGalleryContent | undefined) {
  const hex = (value: string | null | undefined, fallback: string) =>
    value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  const color = (value: string | null | undefined, fallback: string, previousDefault: string) =>
    hex(value?.toUpperCase() === previousDefault ? fallback : value, fallback);
  const start = color(content?.backgroundColor, "#F8F4EB", "#11110F");
  const middle = color(content?.backgroundMiddleColor, "#F2ECE1", "#171713");
  const end = color(content?.backgroundEndColor, "#E8DFD0", "#191711");
  const colors: Record<string, string> = {
    "--pg-background": middle || end ? `linear-gradient(135deg, ${start}, ${middle || start}, ${end || middle || start})` : start,
    "--pg-text": color(content?.textColor, "#1E1208", "#F4EFE5"),
    "--pg-muted": color(content?.mutedTextColor, "#746D61", "#D2C9BB"),
    "--pg-accent": color(content?.accentColor, "#9A6F2C", "#C9A050"),
    "--pg-surface": color(content?.surfaceColor, "#FFFFFF", "#F4EFE5"),
    "--pg-surface-text": color(content?.surfaceTextColor, "#1E1208", "#F4EFE5"),
    "--pg-border": color(content?.borderColor, "#D4C8B1", "#F4EFE5"),
    "--pg-button": color(content?.buttonColor, "#C9A050", "#1E1208"),
    "--pg-button-text": color(content?.buttonTextColor, "#171510", "#F0EDE8"),
  };
  return colors as CSSProperties;
}

export async function generateMetadata({ params }: PrivateGalleryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const page = isLocaleCode(locale) ? await getPrivateGalleryPage(false, locale) : null;
  return {
    title: page?.seo?.metaTitle || page?.title || "Private Gallery",
    description: page?.seo?.metaDescription || undefined,
    robots: { index: false, follow: false },
  };
}

export default async function PrivateGalleryPage({ params, searchParams }: PrivateGalleryPageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocaleCode(locale)) notFound();
  const [galleryPage, home] = await Promise.all([
    getPrivateGalleryPage(false, locale),
    getHomeChrome(false, locale),
  ]);
  const galleryContent = galleryPage?.privateGallery;
  // Keep gallery content on its own page; share only Home's site chrome.
  const siteHeader = home?.header;
  const footerDetails = home?.footer;
  const token = Array.isArray(query.token) ? query.token[0] : query.token;
  const footer = footerDetails
    ? ({ sectionKey: "footer", footer: footerDetails } as SectionContent)
    : null;
  return (
    <div className="private-gallery-layout">
      <Header
        locale={locale}
        homeHref={`/${locale}`}
        forceScrolled
        logo={getStrapiMediaUrl(siteHeader?.logo)}
        siteName={siteHeader?.siteName || undefined}
        links={siteHeader?.links
          ?.filter((link) => !/logout/i.test(`${link.label} ${link.href}`))
          .map((link) => ({
            ...link,
            href: link.href.startsWith("#") ? `/${locale}/${link.href}` : link.href,
          }))}
      />
      <div className="private-gallery-shell" style={galleryPageStyle(galleryContent)}>
        <PrivateGalleryGate
          locale={locale}
          token={token}
          copyOverrides={galleryContent}
        />
      </div>
      {footer && <Footer section={footer} />}
    </div>
  );
}
