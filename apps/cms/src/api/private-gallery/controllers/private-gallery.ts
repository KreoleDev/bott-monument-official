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
  sortOrder?: number | null;
  image?: { url?: string; alternativeText?: string | null } | null;
};

export default {
  async access(ctx: GalleryContext) {
    const body = ctx.request.body as { token?: unknown } | undefined;
    const token = body?.token;
    if (typeof token !== "string" || !/^[\w-]{43}$/.test(token)) {
      ctx.status = 404;
      ctx.body = { error: "Gallery not found" };
      return;
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const inquiry = await strapi.db.query("api::inquiry.inquiry").findOne({
      where: { accessTokenHash: tokenHash, accessApproved: true },
      select: ["documentId", "accessTokenExpiresAt"],
    });
    if (
      !inquiry?.accessTokenExpiresAt ||
      new Date(inquiry.accessTokenExpiresAt).getTime() <= Date.now()
    ) {
      ctx.status = 404;
      ctx.body = { error: "Gallery not found" };
      return;
    }

    const entries = (await strapi.documents("api::private-gallery-item.private-gallery-item").findMany({
      status: "published",
      sort: { sortOrder: "asc", documentId: "asc" },
      populate: { image: true },
      limit: 100,
    })) as PrivateGalleryEntry[];

    ctx.set?.("Cache-Control", "private, no-store");
    ctx.body = {
      images: entries
        .filter((entry) => entry.image?.url)
        .map((entry) => ({
          title: entry.title || "",
          caption: entry.caption || "",
          sortOrder: entry.sortOrder || 0,
          image: {
            url: entry.image?.url,
            alternativeText: entry.image?.alternativeText || entry.title || "",
          },
        })),
    };
  },
};
