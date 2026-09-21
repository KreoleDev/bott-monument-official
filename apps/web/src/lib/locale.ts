export const DEFAULT_LOCALE = "en";

// Strapi locale codes are BCP 47-like values such as en, pt or pt-BR.
// The CMS remains the authority: a syntactically valid URL still returns 404
// unless a published Home localization exists for that exact code.
export function isLocaleCode(value: string): boolean {
  return /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(value) && value.length <= 35;
}

export function localizedPath(locale: string, path = "/"): string {
  const suffix = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? suffix || "/" : `/${locale}${suffix}`;
}

export function localizedHref(locale: string, href: string): string {
  if (
    locale === DEFAULT_LOCALE ||
    !href.startsWith("/") ||
    href.startsWith("//") ||
    href === `/${locale}` ||
    href.startsWith(`/${locale}/`)
  ) {
    return href;
  }
  return localizedPath(locale, href);
}
