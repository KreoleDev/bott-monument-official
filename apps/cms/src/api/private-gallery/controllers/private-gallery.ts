import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, copyFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

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
  photos?: PrivatePhoto[] | null;
};

type PrivatePhoto = { id: string; name: string; alternativeText?: string | null };

const privatePhotoDirectories = [
  path.join(process.cwd(), ".private-gallery-uploads"),
  path.join(process.cwd(), "private-gallery-uploads"), // existing uploads from before the watcher-safe directory
];

async function findPrivatePhotoFile(id: string, name?: string) {
  for (const directory of privatePhotoDirectories) {
    try {
      if (name) {
        const candidate = path.join(directory, `${id}${path.extname(name).toLowerCase()}`);
        const fileStat = await stat(candidate);
        return { filepath: candidate, fileStat };
      }
      const filename = (await readdir(directory)).find((entry) => entry.startsWith(`${id}.`));
      if (filename) {
        const candidate = path.join(directory, filename);
        const fileStat = await stat(candidate);
        return { filepath: candidate, fileStat };
      }
    } catch {
      // Try the previous storage directory for existing private images.
    }
  }
  return null;
}

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
      populate: { category: true },
      limit: 100,
    })) as PrivateGalleryEntry[];

    ctx.set?.("Cache-Control", "private, no-store");
    ctx.body = {
      images: entries.flatMap((entry) => {
        const photos = Array.isArray(entry.photos) ? entry.photos : [];
        if (!photos.length) return [];
        return [{
          title: entry.title || "",
          caption: entry.caption || "",
          category: entry.category?.name || "",
          categorySortOrder: entry.category?.sortOrder ?? 0,
          sortOrder: entry.sortOrder || 0,
          images: photos.map((photo) => ({
            url: `/api/private-gallery/photos/${encodeURIComponent(photo.id)}?email=${encodeURIComponent(email)}${token ? `&token=${encodeURIComponent(token as string)}` : ""}`,
            alternativeText: photo.alternativeText || entry.title || "",
            width: null,
            height: null,
          })),
        }];
      }),
    };
  },

  async photo(ctx: GalleryContext & { params?: { id?: string }; query?: Record<string, string> }) {
    const id = ctx.params?.id || "";
    const email = typeof ctx.query?.email === "string" ? ctx.query.email.trim().toLowerCase() : "";
    const token = ctx.query?.token;
    if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ctx.status = 404;
      ctx.body = { error: "Photo not found" };
      return;
    }
    const where = token
      ? { accessTokenHash: createHash("sha256").update(token).digest("hex"), accessActive: true }
      : { email: { $eqi: email }, accessActive: true };
    const access = await strapi.db.query("api::gallery-access.gallery-access").findOne({ where, select: ["email", "accessTokenExpiresAt"] });
    if (!access || access.email?.toLowerCase() !== email || (token && (!access.accessTokenExpiresAt || new Date(access.accessTokenExpiresAt).getTime() <= Date.now()))) {
      ctx.status = 404;
      ctx.body = { error: "Photo not found" };
      return;
    }
    const entries = await strapi.documents("api::private-gallery-item.private-gallery-item").findMany({ status: "published", limit: 100 });
    const photo = (entries as PrivateGalleryEntry[]).flatMap((entry) => entry.photos || []).find((item) => item.id === id);
    if (!photo) {
      ctx.status = 404;
      ctx.body = { error: "Photo not found" };
      return;
    }
    try {
      const storedPhoto = await findPrivatePhotoFile(photo.id, photo.name);
      if (!storedPhoto) throw new Error("Private photo file not found");
      ctx.set?.("Content-Type", photo.name.toLowerCase().endsWith(".png") ? "image/png" : photo.name.toLowerCase().endsWith(".webp") ? "image/webp" : photo.name.toLowerCase().endsWith(".avif") ? "image/avif" : "image/jpeg");
      ctx.set?.("Content-Length", String(storedPhoto.fileStat.size));
      ctx.set?.("Cache-Control", "private, no-store");
      ctx.body = createReadStream(storedPhoto.filepath);
    } catch {
      ctx.status = 404;
      ctx.body = { error: "Photo not found" };
    }
  },

  async upload(ctx: { request: { files?: unknown }; get?: (name: string) => string; status?: number; body?: unknown }) {
    const rawFiles = ctx.request.files as Record<string, unknown> | undefined;
    const fileInput = rawFiles?.files;
    const files = (Array.isArray(fileInput) ? fileInput : fileInput ? [fileInput] : []) as Array<{ filepath?: string; originalFilename?: string; mimetype?: string; size?: number }>;
    if (!files.length || files.length > 20 || files.some((file) => !file.filepath || !/^image\/(jpeg|png|webp|avif)$/.test(file.mimetype || "") || (file.size || 0) > 25 * 1024 * 1024)) {
      ctx.status = 400;
      ctx.body = { error: "Choose up to 20 JPEG, PNG, WebP, or AVIF images." };
      return;
    }
    const directory = privatePhotoDirectories[0];
    await mkdir(directory, { recursive: true });
    const photos: PrivatePhoto[] = [];
    const requestedId = ctx.get?.("X-Private-Photo-Id") || "";
    for (const file of files) {
      const name = path.basename(file.originalFilename || "private-photo.jpg");
      // The client reuses this ID if the connection drops after the file is
      // copied, making a retry safe instead of leaving duplicate private files.
      const id = /^[0-9a-f-]{36}$/i.test(requestedId) && files.length === 1 ? requestedId : randomUUID();
      const extension = path.extname(name).toLowerCase() || ".jpg";
      await copyFile(file.filepath!, path.join(directory, `${id}${extension}`));
      photos.push({ id, name, alternativeText: "" });
    }
    ctx.body = { photos };
  },

  async adminPhoto(ctx: { params?: { id?: string }; status?: number; body?: unknown; set?: (name: string, value: string) => void }) {
    const id = ctx.params?.id || "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      ctx.status = 404;
      ctx.body = { error: "Photo not found" };
      return;
    }
    try {
      const storedPhoto = await findPrivatePhotoFile(id);
      if (!storedPhoto) throw new Error("Private photo file not found");
      const extension = path.extname(storedPhoto.filepath).toLowerCase();
      const contentType = extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : extension === ".avif" ? "image/avif" : "image/jpeg";
      ctx.set?.("Content-Type", contentType);
      ctx.set?.("Content-Length", String(storedPhoto.fileStat.size));
      ctx.set?.("Cache-Control", "private, no-store");
      ctx.body = createReadStream(storedPhoto.filepath);
    } catch {
      ctx.status = 404;
      ctx.body = { error: "Photo not found" };
    }
  },
};
