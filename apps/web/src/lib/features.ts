import { getCollection } from "./strapi-collection";
import type { StrapiMedia } from "./strapi";

export type Feature = {
  documentId: string;
  title: string;
  publication: string | null;
  detail: string | null;
  featured: boolean;
  sortOrder: number;
  updatedAt: string | null;
  image: StrapiMedia | null;
};

export async function getFeatures(preview = false, locale = "en"): Promise<Feature[]> {
  return getCollection<Feature>(
    "features_connection",
    "documentId title publication detail featured sortOrder updatedAt image { url alternativeText width height }",
    ["sortOrder:asc", "documentId:asc"],
    preview,
    locale,
  );
}
