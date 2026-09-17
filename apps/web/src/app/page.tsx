import { draftMode } from "next/headers";
import {
  Header,
  Hero,
  MarqueeStrip,
  Founder,
  News,
  Gallery,
  Showroom,
  Testimonials,
  Contact,
  Footer,
} from "@/components";
import { FeaturedIn } from "@/components/featured-in";
import { getHomepageSections, getStrapiMediaUrl } from "@/lib/strapi";
import { getComments } from "@/lib/comments";
import { getGalleryItems } from "@/lib/gallery";
import { getFeatures } from "@/lib/features";
import { getPressItems } from "@/lib/news";
import { getSiteSettings } from "@/lib/site-settings";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PreviewBanner } from "@/components/preview-banner";

export default async function Home() {
  const preview = (await draftMode()).isEnabled;
  const [sections, comments, items, features, press, settings] = await Promise.all([
    getHomepageSections(preview),
    getComments(preview),
    getGalleryItems(preview),
    getFeatures(preview),
    getPressItems(preview),
    getSiteSettings(preview),
  ]);
  const footer = sections.find((s) => s.sectionKey === "footer") || null;
  return (
    <>
      <Header logo={getStrapiMediaUrl(settings?.logo)} siteName={settings?.siteName || undefined} />
      <main id="main-content">
        {sections.map((section) => {
          switch (section.sectionKey) {
            case "hero":
              return <Hero key="hero" section={section} />;
            case "marquee":
              return <MarqueeStrip key="marquee" section={section} />;
            case "founder":
              return <Founder key="founder" section={section} />;
            case "news":
              return <News key="news" section={section} items={press} />;
            case "featured-in":
              return <FeaturedIn key="featured-in" section={section} features={features} />;
            case "gallery":
              return <Gallery key="gallery" section={section} items={items} />;
            case "showroom":
              return <Showroom key="showroom" section={section} />;
            case "testimonials":
              return <Testimonials key="testimonials" section={section} comments={comments} />;
            case "contact":
              return <Contact key="contact" section={section} />;
            default:
              return null;
          }
        })}
        {!sections.length && (
          <section className="cms-unavailable">
            <h1>Bott Monument</h1>
            <p>Our site is temporarily unavailable. Please try again shortly.</p>
          </section>
        )}
      </main>
      <Footer section={footer} settings={settings} />
      <ScrollReveal />
      {preview && <PreviewBanner />}
    </>
  );
}
