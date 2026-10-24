import { createHash } from "node:crypto";

type GalleryContext = {
  request: { body?: unknown };
  status?: number;
  body?: unknown;
  set?: (name: string, value: string) => void;
};

type PrivateGalleryEntry = {
  title?: string;
  caption?: string | null;
  category?: { documentId?: string; name?: string; sortOrder?: number | null } | null;
  sortOrder?: number | null;
  image?: { url?: string; alternativeText?: string | null } | null;
};

export default {
  async access(ctx: GalleryContext) {
    const body = ctx.request.body as { token?: unknown; email?: unknown } | undefined;
    const token = body?.token;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      (token !== undefined && (typeof token !== "string" || !/^[\w-]{43}$/.test(token)))
    ) {
      ctx.status = 404;
      ctx.body = { error: "Gallery not found" };
      return;
    }

    const where = token
      ? {
          accessTokenHash: createHash("sha256").update(token as string).digest("hex"),
          accessActive: true,
        }
      : { email: { $eqi: email }, accessActive: true };
    const access = await strapi.db.query("api::gallery-access.gallery-access").findOne({
      where,
      select: ["documentId", "email", "accessTokenExpiresAt"],
    });
    if (!access || access.email?.toLowerCase() !== email || (token && (
      !access.accessTokenExpiresAt || new Date(access.accessTokenExpiresAt).getTime() <= Date.now()
    ))) {
      ctx.status = 404;
      ctx.body = { error: "Gallery not found" };
      return;
    }

    const entries = (await strapi.documents("api::private-gallery-item.private-gallery-item").findMany({
      status: "published",
      sort: { sortOrder: "asc", documentId: "asc" },
      populate: { image: true, category: true },
      limit: 100,
    })) as PrivateGalleryEntry[];

    ctx.set?.("Cache-Control", "private, no-store");
    ctx.body = {
      images: entries
        .filter((entry) => entry.image?.url)
        .map((entry) => ({
          title: entry.title || "",
          caption: entry.caption || "",
          category: entry.category?.name || "",
          categorySortOrder: entry.category?.sortOrder ?? 0,
          sortOrder: entry.sortOrder || 0,
          image: {
            url: entry.image?.url,
            alternativeText: entry.image?.alternativeText || entry.title || "",
          },
        })),
    };
  },
};
