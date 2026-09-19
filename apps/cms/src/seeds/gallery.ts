import type { Core } from "@strapi/strapi";
import { stat } from "node:fs/promises";
import path from "node:path";
import items from "./gallery.json";

export async function seedGallery(strapi: Core.Strapi) {
  for (const [index, item] of items.entries()) {
    const name = `gallery-${item.file}`;
    let media = await strapi.db.query("plugin::upload.file").findOne({ where: { name } });
    if (!media) {
      const filepath = path.resolve(
        strapi.dirs.app.root,
        "../../bott-monument-design/images",
        item.file,
      );
      const info = await stat(filepath);
      [media] = await strapi
        .plugin("upload")
        .service("upload")
        .upload({
          data: { fileInfo: { name, alternativeText: item.alt } },
          files: { filepath, originalFilename: name, mimetype: "image/jpeg", size: info.size },
        });
    }
    const existing = await strapi
      .documents("api::gallery-item.gallery-item")
      .findFirst({ filters: { image: { id: media.id } } });
    if (existing) continue;
    await strapi.documents("api::gallery-item.gallery-item").create({
      status: "published",
      data: {
        title: item.title,
        subtitle: item.subtitle,
        imagePosition: item.imagePosition,
        sortOrder: index + 1,
        image: media.id,
      },
    });
  }
  strapi.log.info("Gallery items published.");
}
