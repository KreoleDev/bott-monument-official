import { getCollection } from "./strapi-collection";
import type { StrapiMedia } from "./strapi";

export type GalleryItem = {
  documentId: string;
  title: string;
  subtitle: string | null;
  imagePosition: string | null;
  image: StrapiMedia | null;
};

export async function getGalleryItems(preview = false, locale = "en"): Promise<GalleryItem[]> {
  return getCollection<GalleryItem>(
    "galleryItems_connection",
    "documentId title subtitle imagePosition sortOrder image { url alternativeText }",
    ["sortOrder:asc", "documentId:asc"],
    preview,
    locale,
  );
}
