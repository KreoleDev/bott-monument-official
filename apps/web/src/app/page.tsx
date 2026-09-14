import {
  About,
  Contact,
  Footer,
  Gallery,
  Header,
  Hero,
  Philosophy,
  Testimonials,
} from "@/components";
import { getHomepageSection } from "@/lib/strapi";

export default async function Home() {
  const hero = await getHomepageSection("hero");

  return (
    <>
      <Header />
      <main>
        <Hero section={hero} />
        <Philosophy />
        <Gallery />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
