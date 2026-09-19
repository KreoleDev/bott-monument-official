import type { Metadata } from "next";
import { getHomePage } from "@/lib/pages";
import { getStrapiMediaUrl } from "@/lib/strapi";
import { draftMode } from "next/headers";
import { Footer, Header, Hero } from "@/components";
import { PreviewBanner } from "@/components/preview-banner";
import { ScrollReveal } from "@/components/scroll-reveal";
import { RenderPage, getPage } from "@/page-builder";

export async function generateMetadata(): Promise<Metadata> {
  const preview = (await draftMode()).isEnabled;
  const home = await getHomePage(preview);
  const title = home?.seo?.metaTitle || home?.header?.siteName || "Bott Monument";
  const description =
    home?.seo?.metaDescription || "Custom memorials crafted in stone.";
  const image = getStrapiMediaUrl(home?.seo?.metaImage);
  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, ...(image ? { images: [image] } : {}) },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function Home() {
  const preview = (await draftMode()).isEnabled;
  const page = await getPage({ preview });

  return (
    <>
      <Header {...page.header} />
      <main id="main-content">
        {page.hero && <Hero section={page.hero} />}
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
