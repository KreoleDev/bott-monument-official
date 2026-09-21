import { notFound, permanentRedirect } from "next/navigation";
import { draftMode } from "next/headers";
import { DEFAULT_LOCALE, isLocaleCode } from "@/lib/locale";
import { getHomePage } from "@/lib/pages";
import { NewsPage } from "../../news-page";

export default async function LocalizedNewsPage({ params }: PageProps<"/[locale]/news">) {
  const { locale } = await params;
  if (locale === DEFAULT_LOCALE) permanentRedirect("/news");
  const preview = (await draftMode()).isEnabled;
  if (!isLocaleCode(locale)) notFound();
  const home = await getHomePage(preview, locale);
  if (!home) notFound();
  return <NewsPage locale={home.locale} />;
}
