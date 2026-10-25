type PrivateImage = {
  title: string;
  caption: string;
  category: string;
  sortOrder: number;
  images: { url: string; alternativeText: string | null; width?: number | null; height?: number | null }[];
};

function allowedOrigins(request: Request) {
  const url = new URL(request.url);
  const origins = new Set([url.origin]);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  if (host) origins.add(`${protocol}://${host}`);
  return origins;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins(request).has(origin))
    return Response.json({ error: "Gallery not found" }, { status: 404 });

  try {
    const body = (await request.json()) as { email?: unknown; token?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const token = body.token;
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      (token !== undefined && (typeof token !== "string" || !/^[\w-]{43}$/.test(token)))
    )
      return Response.json({ error: "Gallery not found" }, { status: 404 });

    const cmsUrl = process.env.STRAPI_URL?.replace(/\/$/, "");
    if (!cmsUrl) return Response.json({ error: "Gallery unavailable" }, { status: 503 });

    const response = await fetch(`${cmsUrl}/api/private-gallery/access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return Response.json({ error: "Gallery not found" }, { status: 404 });

    const result = (await response.json()) as {
      images?: Array<PrivateImage | (Omit<PrivateImage, "images"> & { image?: PrivateImage["images"][number] })>;
    };
    const cmsOrigin = new URL(cmsUrl).origin;
    const images = Array.isArray(result.images)
      ? result.images.flatMap((item) => {
          const photos = "images" in item && Array.isArray(item.images)
            ? item.images
            : "image" in item && item.image
              ? [item.image]
              : [];
          const safePhotos = photos.flatMap((photo) => {
            if (typeof photo?.url !== "string") return [];
            let imageUrl = photo.url;
            if (imageUrl.startsWith("/")) imageUrl = `${cmsOrigin}${imageUrl}`;
            if (!/^https:\/\//i.test(imageUrl) && !/^http:\/\/localhost(?::\d+)?\//i.test(imageUrl)) return [];
            return [{ ...photo, url: imageUrl }];
          });
          return safePhotos.length ? [{ ...item, images: safePhotos }] : [];
        })
      : [];

    return Response.json({ images }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Gallery unavailable" }, { status: 503 });
  }
}
