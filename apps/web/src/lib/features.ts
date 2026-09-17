import { getCollection } from "./strapi-collection";
import type { StrapiMedia } from "./strapi";

export type Feature = {
  documentId: string;
  title: string;
  publication: string | null;
  detail: string | null;
  featured: boolean;
  sortOrder: number;
  image: StrapiMedia | null;
};

export async function getFeatures(preview = false): Promise<Feature[]> {
  return getCollection<Feature>(
    "features_connection",
    "documentId title publication detail featured sortOrder image { url alternativeText }",
    ["sortOrder:asc", "documentId:asc"],
    preview,
  );
}
