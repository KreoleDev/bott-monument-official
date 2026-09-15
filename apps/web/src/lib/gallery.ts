import type { StrapiMedia } from "./strapi";

export type GalleryItem = { documentId: string; title: string; subtitle: string | null; imagePosition: string | null; image: StrapiMedia | null; };

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const url = process.env.STRAPI_URL?.replace(/\/$/, "");
  const token = process.env.STRAPI_API_TOKEN;
  if (!url || !token) return [];

  try {
    const response = await fetch(`${url}/graphql`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: `
        query GalleryItems {
          galleryItems(status: PUBLISHED, sort: ["sortOrder:asc", "documentId:asc"], pagination: { limit: 100 }) {
            documentId title subtitle imagePosition sortOrder
            image { url alternativeText }
          }
        }
      ` }),
      ...(process.env.NODE_ENV === "development"
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60 } }),
    });
    if (!response.ok) throw new Error(`Strapi returned ${response.status}`);
    const result = await response.json() as {
      data?: { galleryItems: GalleryItem[] }; errors?: { message: string }[];
    };
    if (result.errors?.length) throw new Error(result.errors.map(e => e.message).join(", "));
    return result.data?.galleryItems ?? [];
  } catch (error) {
    console.warn("Could not fetch galleryItems from Strapi", error);
    return [];
  }
}
