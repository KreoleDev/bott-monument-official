export const DEFAULT_LOCALE = "en";

// Strapi locale codes are BCP 47-like values such as en, pt or pt-BR.
// The CMS remains the authority: a syntactically valid URL still returns 404
// unless a published Home localization exists for that exact code.
export function isLocaleCode(value: string): boolean {
  return /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(value) && value.length <= 35;
}

export function localizedPath(locale: string, path = "/"): string {
  const suffix = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${suffix}`;
}

export function localizedHref(locale: string, href: string): string {
  if (
    !href.startsWith("/") ||
    href.startsWith("//") ||
    href === `/${locale}` ||
    href.startsWith(`/${locale}/`)
  ) {
    return href;
  }
  return localizedPath(locale, href);
}

export function preferredLocale(acceptLanguage: string | null, available: string[]): string {
  const locales = [...new Set(available.filter(isLocaleCode))];
  if (!locales.length) return DEFAULT_LOCALE;
  const requested = (acceptLanguage || "")
    .split(",")
    .map((part) => {
      const [code, ...parameters] = part.trim().split(";");
      const quality = parameters
        .map((value) => value.trim().match(/^q=(0(?:\.\d+)?|1(?:\.0+)?)$/i)?.[1])
        .find(Boolean);
      return { code, quality: quality === undefined ? 1 : Number(quality) };
    })
    .filter(({ code, quality }) => quality > 0 && isLocaleCode(code))
    .sort((a, b) => b.quality - a.quality);
  for (const { code } of requested) {
    const exact = locales.find((locale) => locale.toLowerCase() === code.toLowerCase());
    if (exact) return exact;
    const language = code.split("-")[0].toLowerCase();
    const base = locales.find((locale) => locale.split("-")[0].toLowerCase() === language);
    if (base) return base;
  }
  return locales.find((locale) => locale === DEFAULT_LOCALE) || locales[0];
}
