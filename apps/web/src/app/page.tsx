import {
  Showroom,
  Contact,
  Footer,
  Gallery,
  Header,
  Hero,
  MarqueeStrip,
  Founder,
  News,
  Testimonials,
} from "@/components";
import { getHomepageSection } from "@/lib/strapi";
import { getComments } from "@/lib/comments";
import { getGalleryItems } from "@/lib/gallery";
import { getFeatures } from "@/lib/features";
import { getPressItems } from "@/lib/news";
import { FeaturedIn } from "@/components/featured-in";

export default async function Home() {
  const [hero, marquee, founder, news, pressItems, featuredIn, features, gallery, galleryItems, showroom, testimonials, comments, contact, footer] = await Promise.all([
    getHomepageSection("hero"),
    getHomepageSection("marquee"),
    getHomepageSection("founder"),
    getHomepageSection("news"),
    getPressItems(),
    getHomepageSection("featured-in"),
    getFeatures(),
    getHomepageSection("gallery"),
    getGalleryItems(),
    getHomepageSection("showroom"),
    getHomepageSection("testimonials"),
    getComments(),
    getHomepageSection("contact"),
    getHomepageSection("footer"),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero section={hero} />
        <MarqueeStrip section={marquee} />
        <Founder section={founder} />
        <News section={news} items={pressItems} />
        <FeaturedIn section={featuredIn} features={features} />
        <Gallery section={gallery} items={galleryItems} />
        <Showroom section={showroom} />
        <Testimonials section={testimonials} comments={comments} />
        <Contact section={contact} />
      </main>
      <Footer section={footer} />
    </>
  );
}
