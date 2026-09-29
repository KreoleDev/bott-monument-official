import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { isLocaleCode } from "@/lib/locale";
import { getHomePage } from "@/lib/pages";
import { NewsPage } from "../../news-page";

export default async function LocalizedNewsPage({ params }: PageProps<"/[locale]/news">) {
  const { locale } = await params;
  const preview = (await draftMode()).isEnabled;
  if (!isLocaleCode(locale)) notFound();
  const home = await getHomePage(preview, locale);
  if (!home) notFound();
  return <NewsPage locale={home.locale} />;
}
