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

export function pressDate(date: string | null) {
  if (!date) return null;
  const value = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(value.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(value);
}

export async function getPressItems(): Promise<PressItem[]> {
  const url = process.env.STRAPI_URL?.replace(/\/$/, "");
  const token = process.env.STRAPI_API_TOKEN;
  if (!url || !token) return [];

  try {
    const response = await fetch(`${url}/graphql`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: `
        query PressItems {
          pressItems(status: PUBLISHED, sort: ["sortOrder:asc", "date:desc"], pagination: { limit: 100 }) {
            documentId title source date category url featured
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
      data?: { pressItems: PressItem[] }; errors?: { message: string }[];
    };
    if (result.errors?.length) throw new Error(result.errors.map(e => e.message).join(", "));
    return result.data?.pressItems ?? [];
  } catch (error) {
    console.warn("Could not fetch press items from Strapi", error);
    return [];
  }
}
