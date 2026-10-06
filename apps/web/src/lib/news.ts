import { getCollection } from "./strapi-collection";
import { DEFAULT_LOCALE } from "./locale";
import { getStrapiMediaUrl } from "./strapi";
import type { PressItem } from "./news-shared";
export type { PressItem } from "./news-shared";

const PRESS_ITEM_FIELDS =
  "documentId title source date category url featured image { url alternativeText }";
const PRESS_ITEM_SORT = ["sortOrder:asc", "date:desc", "documentId:asc"];

function normalizePressImage(item: PressItem): PressItem {
  const url = getStrapiMediaUrl(item.image);
  return {
    ...item,
    image: item.image && url ? { ...item.image, url } : item.image,
  };
}

export async function getPressItems(preview = false, locale = "en"): Promise<PressItem[]> {
  const items = (
    await getCollection<PressItem>(
      "pressItems_connection",
      PRESS_ITEM_FIELDS,
      PRESS_ITEM_SORT,
      preview,
      locale,
    )
  ).map(normalizePressImage);
  if (locale === DEFAULT_LOCALE || items.every((item) => item.image)) return items;

  const defaultItems = (
    await getCollection<PressItem>(
      "pressItems_connection",
      PRESS_ITEM_FIELDS,
      PRESS_ITEM_SORT,
      preview,
      DEFAULT_LOCALE,
    )
  ).map(normalizePressImage);
  const defaultImages = new Map(
    defaultItems
      .filter((item) => item.image)
      .map((item) => [item.documentId, item.image] as const),
  );

  return items.map((item) => ({
    ...item,
    image: item.image ?? defaultImages.get(item.documentId) ?? null,
  }));
}
