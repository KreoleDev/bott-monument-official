import { draftMode } from "next/headers";
import { PreviewBanner } from "@/components/preview-banner";
import Link from "next/link";
import { News } from "@/components/news";
import { getPressItems } from "@/lib/news";

export const metadata = { title: "Press Coverage" };

export default async function NewsPage() {
  const preview = (await draftMode()).isEnabled;
  const items = await getPressItems(preview);
  return (
    <main>
      <nav className="news-back-nav" aria-label="Back to main site">
        <Link href="/">← Bott Monument</Link>
      </nav>
      <News items={items} all />
      {preview && <PreviewBanner />}
    </main>
  );
}
