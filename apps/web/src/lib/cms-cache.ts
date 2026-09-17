import { unstable_cache } from "next/cache";
import { createHash } from "node:crypto";

const state = globalThis as typeof globalThis & { cmsLastGood?: Map<string, unknown> };
const lastGood = (state.cmsLastGood ??= new Map<string, unknown>());
export function clearCmsMemory() {
  lastGood.clear();
}

/** Cache only successful, complete public reads. An intentional empty result replaces old content. */
export async function cmsRead<T>(
  key: string,
  loader: () => Promise<T>,
  empty: T,
  preview = false,
): Promise<T> {
  const scope = createHash("sha256")
    .update(`${process.env.STRAPI_URL}|${process.env.STRAPI_API_TOKEN}`)
    .digest("hex");
  const cacheKey = `${scope}:${key}`;
  try {
    const value =
      preview || process.env.NODE_ENV !== "production"
        ? await loader()
        : await unstable_cache(loader, [cacheKey], { revalidate: 60, tags: ["cms"] })();
    if (!preview) lastGood.set(cacheKey, value);
    return value;
  } catch (error) {
    console.warn(
      `CMS read failed: ${key}`,
      error instanceof Error ? error.message : "Unknown error",
    );
    return !preview && lastGood.has(cacheKey) ? (lastGood.get(cacheKey) as T) : empty;
  }
}

export async function cmsQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
  preview = false,
): Promise<T> {
  const url = process.env.STRAPI_URL?.replace(/\/$/, "");
  const token = preview
    ? process.env.STRAPI_PREVIEW_TOKEN || process.env.STRAPI_API_TOKEN
    : process.env.STRAPI_API_TOKEN;
  if (!url || !token) throw new Error("Missing CMS configuration");
  const response = await fetch(`${url}/graphql`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`CMS returned ${response.status}`);
  const result = await response.json();
  if (result.errors?.length || !result.data) throw new Error("Invalid CMS response");
  return result.data as T;
}
