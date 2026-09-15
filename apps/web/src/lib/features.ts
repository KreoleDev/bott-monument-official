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

export async function getFeatures(): Promise<Feature[]> {
  const url = process.env.STRAPI_URL?.replace(/\/$/, "");
  const token = process.env.STRAPI_API_TOKEN;
  if (!url || !token) return [];

  try {
    const response = await fetch(`${url}/graphql`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: `
        query Features {
          features(status: PUBLISHED, sort: ["sortOrder:asc", "documentId:asc"], pagination: { limit: 100 }) {
            documentId title publication detail featured sortOrder
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
      data?: { features: Feature[] }; errors?: { message: string }[];
    };
    if (result.errors?.length) throw new Error(result.errors.map(e => e.message).join(", "));
    return result.data?.features ?? [];
  } catch (error) {
    console.warn("Could not fetch features from Strapi", error);
    return [];
  }
}
