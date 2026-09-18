import type { HomepageSection } from "@/lib/strapi";
import { CHROME_FRAGMENT_KEYS, MAPPERS } from "./mappers";
import type { FragmentName, MappedFragment, PageExtras } from "./types";

const CHROME_KEYS = new Set<string>(CHROME_FRAGMENT_KEYS);

function isFragmentName(key: string): key is FragmentName {
  return Object.hasOwn(MAPPERS, key);
}

export function mapSections(sections: HomepageSection[], extras: PageExtras): MappedFragment[] {
  return sections.flatMap((section) => {
    const key = section.sectionKey;
    if (!isFragmentName(key) || CHROME_KEYS.has(key)) return [];
    const mapper = MAPPERS[key];
    return [
      {
        fragmentName: key,
        payload: mapper(section, extras) as Record<string, unknown>,
      },
    ];
  });
}

export function mapFooterChrome(sections: HomepageSection[], extras: PageExtras) {
  const footer = sections.find((section) => section.sectionKey === "footer") ?? null;
  return footer ? MAPPERS.footer(footer, extras) : null;
}
