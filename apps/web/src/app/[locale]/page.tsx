import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { HomePage, homeMetadata } from "../home-page";
import { getHomePage } from "@/lib/pages";
import { isLocaleCode } from "@/lib/locale";

async function publishedLocale(value: string) {
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
