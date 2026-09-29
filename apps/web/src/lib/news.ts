import { getCollection } from "./strapi-collection";
import { getStrapiMediaUrl, type StrapiMedia } from "./strapi";

export type PressItem = {
  documentId: string;
  title: string;
  source: string;
  date: string | null;
  category: string | null;
  url: string;
  image: StrapiMedia | null;
  featured: boolean;
};

export function pressImageUrl(item: PressItem) {
  return getStrapiMediaUrl(item.image);
}

export function pressDate(date: string | null, locale = "en") {
  if (!date) return null;
  const value = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(value.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export async function getPressItems(preview = false, locale = "en"): Promise<PressItem[]> {
  return getCollection<PressItem>(
    "pressItems_connection",
    "documentId title source date category url featured image { url alternativeText }",
    ["sortOrder:asc", "date:desc", "documentId:asc"],
    preview,
    locale,
  );
}
