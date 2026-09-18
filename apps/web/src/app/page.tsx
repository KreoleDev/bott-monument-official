import { draftMode } from "next/headers";
import { Footer, Header } from "@/components";
import { PreviewBanner } from "@/components/preview-banner";
import { ScrollReveal } from "@/components/scroll-reveal";
import { RenderPage, getPage } from "@/page-builder";

export default async function Home() {
  const preview = (await draftMode()).isEnabled;
  const page = await getPage({ preview });

  return (
    <>
      <Header logo={page.header.logo} siteName={page.header.siteName} />
      <main id="main-content">
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
