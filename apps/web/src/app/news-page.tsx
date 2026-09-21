import { draftMode } from "next/headers";
import Link from "next/link";
import { PreviewBanner } from "@/components/preview-banner";
import { News } from "@/components/news";
import { localizedPath } from "@/lib/locale";
import { getPressItems } from "@/lib/news";
import { getHomePage } from "@/lib/pages";

export async function NewsPage({ locale }: { locale: string }) {
  const preview = (await draftMode()).isEnabled;
  const [items, home] = await Promise.all([
    getPressItems(preview, locale),
    getHomePage(preview, locale),
  ]);
  return (
    <main>
      <nav className="news-back-nav" aria-label="Back to main site">
        <Link href={localizedPath(locale)}>← {home?.header?.siteName || "Bott Monument"}</Link>
      </nav>
      <News items={items} all locale={locale} />
      {preview && <PreviewBanner />}
    </main>
  );
}
