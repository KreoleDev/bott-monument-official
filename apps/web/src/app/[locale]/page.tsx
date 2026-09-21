import { notFound, permanentRedirect } from "next/navigation";
import { draftMode } from "next/headers";
import { HomePage, homeMetadata } from "../home-page";
import { getHomePage } from "@/lib/pages";
import { DEFAULT_LOCALE, isLocaleCode } from "@/lib/locale";

async function publishedLocale(value: string) {
  if (value === DEFAULT_LOCALE) permanentRedirect("/");
  const preview = (await draftMode()).isEnabled;
  if (!isLocaleCode(value)) notFound();
  const home = await getHomePage(preview, value);
  if (!home) notFound();
  return home.locale;
}

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  return homeMetadata(await publishedLocale(locale));
}

export default async function LocalizedHome({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  return <HomePage locale={await publishedLocale(locale)} />;
}
