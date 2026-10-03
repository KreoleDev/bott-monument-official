import { getCollection } from "./strapi-collection";
import type { PressItem } from "./news-shared";
export type { PressItem } from "./news-shared";

export async function getPressItems(preview = false, locale = "en"): Promise<PressItem[]> {
  return getCollection<PressItem>(
    "pressItems_connection",
    "documentId title source date category url featured image { url alternativeText }",
    ["sortOrder:asc", "date:desc", "documentId:asc"],
    preview,
    locale,
  );
}
