import { draftMode } from "next/headers";
import { PreviewBanner } from "@/components/preview-banner";
import Link from "next/link";
import { News } from "@/components/news";
import { getHomePage } from "@/lib/pages";
import { getPressItems } from "@/lib/news";

export const metadata = { title: "Press Coverage" };

export default async function NewsPage() {
  const preview = (await draftMode()).isEnabled;
  const [items, home] = await Promise.all([getPressItems(preview), getHomePage(preview)]);
  return (
    <main>
      <nav className="news-back-nav" aria-label="Back to main site">
        <Link href="/">← {home?.header?.siteName || "Bott Monument"}</Link>
      </nav>
      <News items={items} all />
      {preview && <PreviewBanner />}
    </main>
  );
}
