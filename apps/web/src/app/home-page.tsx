import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Footer, Header, Hero } from "@/components";
import { PreviewBanner } from "@/components/preview-banner";
import { ScrollReveal } from "@/components/scroll-reveal";
import { localizedPath } from "@/lib/locale";
import { getHomePage } from "@/lib/pages";
import { getStrapiMediaUrl } from "@/lib/strapi";
import { RenderPage, getPage } from "@/page-builder";

export async function homeMetadata(locale: string): Promise<Metadata> {
  const preview = (await draftMode()).isEnabled;
  const home = await getHomePage(preview, locale);
  const title = home?.seo?.metaTitle || home?.header?.siteName || "Bott Monument";
  const description = home?.seo?.metaDescription || "Custom memorials crafted in stone.";
  const image = getStrapiMediaUrl(home?.seo?.metaImage);
  const languages = Object.fromEntries(
    [home?.locale, ...(home?.localizations || []).map((item) => item.locale)]
      .filter((code): code is string => Boolean(code))
      .map((code) => [code, localizedPath(code)]),
  );
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: localizedPath(locale),
      ...(Object.keys(languages).length ? { languages } : {}),
    },
    openGraph: { title, description, locale, ...(image ? { images: [image] } : {}) },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export async function HomePage({ locale }: { locale: string }) {
  const preview = (await draftMode()).isEnabled;
  const page = await getPage({ preview, locale });

  return (
    <>
      <Header {...page.header} />
      <main id="main-content">
        {page.hero && <Hero section={page.hero} locale={locale} />}
        <RenderPage content={page.content} />
        {!page.hasSections && (
          <section className="cms-unavailable">
            <h1>Bott Monument</h1>
            <p>Our site is temporarily unavailable. Please try again shortly.</p>
          </section>
        )}
      </main>
      {page.footer && <Footer {...page.footer} />}
      <ScrollReveal />
      {preview && <PreviewBanner />}
    </>
  );
}
