import "server-only";

import { draftMode, headers } from "next/headers";
import { DEFAULT_LOCALE, preferredLocale } from "./locale";
import { getHomePage } from "./pages";

export async function detectedLocale(): Promise<string> {
  const preview = (await draftMode()).isEnabled;
  const home = await getHomePage(preview, DEFAULT_LOCALE);
  const candidates = [
    home?.locale,
    ...(home?.localizations || []).map((localization) => localization.locale),
  ].filter((locale): locale is string => Boolean(locale));
  const localizedHomes = await Promise.all(
    [...new Set(candidates)].map((locale) =>
      locale === home?.locale ? Promise.resolve(home) : getHomePage(preview, locale),
    ),
  );
  const available = localizedHomes.flatMap((page) => (page ? [page.locale] : []));
  const acceptLanguage = (await headers()).get("accept-language");
  return preferredLocale(acceptLanguage, available.length ? available : [DEFAULT_LOCALE]);
}
