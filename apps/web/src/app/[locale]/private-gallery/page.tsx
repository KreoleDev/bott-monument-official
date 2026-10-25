import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components";
import { isLocaleCode } from "@/lib/locale";
import { getHomePage, getPageBySlug, type CmsPage } from "@/lib/pages";
import { getStrapiMediaUrl, type SectionContent } from "@/lib/strapi";
import { PrivateGalleryGate } from "./private-gallery-gate";
import "./private-gallery.css";

export const dynamic = "force-dynamic";

type PrivateGalleryPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

function galleryPageStyle(content: CmsPage["privateGallery"] | undefined) {
  const hex = (value: string | null | undefined, fallback: string) =>
    value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  const color = (value: string | null | undefined, fallback: string, previousDefault: string) =>
    hex(value?.toUpperCase() === previousDefault ? fallback : value, fallback);
  const start = color(content?.backgroundColor, "#11110F", "#F0EDE8");
  const middle = color(content?.backgroundMiddleColor, "#171713", "");
  const end = color(content?.backgroundEndColor, "#191711", "");
  const colors: Record<string, string> = {
    "--pg-background": middle || end ? `linear-gradient(135deg, ${start}, ${middle || start}, ${end || middle || start})` : start,
    "--pg-text": color(content?.textColor, "#F4EFE5", "#1E1208"),
    "--pg-muted": color(content?.mutedTextColor, "#D2C9BB", "#746D61"),
    "--pg-accent": hex(content?.accentColor, "#C9A050"),
    "--pg-surface": color(content?.surfaceColor, "#25231D", "#F8F4EB"),
    "--pg-surface-text": color(content?.surfaceTextColor, "#F4EFE5", "#1E1208"),
    "--pg-border": color(content?.borderColor, "#5F5238", "#D4C8B1"),
    "--pg-button": color(content?.buttonColor, "#C9A050", "#1E1208"),
    "--pg-button-text": color(content?.buttonTextColor, "#171510", "#F0EDE8"),
  };
  return colors as CSSProperties;
}

export async function generateMetadata({ params }: PrivateGalleryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const page = isLocaleCode(locale) ? await getPageBySlug("private-gallery", false, locale) : null;
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
    getPageBySlug("private-gallery", false, locale),
    getHomePage(false, locale),
  ]);
  const siteHeader = galleryPage?.header || home?.header;
  const footerDetails = galleryPage?.footer || home?.footer;
  const token = Array.isArray(query.token) ? query.token[0] : query.token;
  const footer = footerDetails
    ? ({ sectionKey: "footer", footer: footerDetails } as SectionContent)
    : null;
  return (
    <div className="private-gallery-shell" style={galleryPageStyle(galleryPage?.privateGallery)}>
      <Header
        locale={locale}
        homeHref={`/${locale}`}
        logo={getStrapiMediaUrl(siteHeader?.logo)}
        siteName={siteHeader?.siteName || undefined}
        links={siteHeader?.links
          ?.filter((link) => !/logout/i.test(`${link.label} ${link.href}`))
          .map((link) => ({
            ...link,
            href: link.href.startsWith("#") ? `/${locale}/${link.href}` : link.href,
          }))}
      />
      <PrivateGalleryGate
        locale={locale}
        token={token}
        pageTitle={galleryPage?.privateGallery?.title || galleryPage?.title}
        copyOverrides={galleryPage?.privateGallery}
      />
      {footer && <Footer section={footer} />}
    </div>
  );
}
