import type { Core } from "@strapi/strapi";
import { stat } from "node:fs/promises";
import path from "node:path";

// One-time content import from the local design. Existing entries are preserved.
export async function seedNews(strapi: Core.Strapi) {
  const stories = [
    {
      title: "Holds Up Mammoth 11.50‑Ton Quarter Pounder",
      source: "Cowboy State Daily",
      date: "2024-10-23",
      category: "Feature",
      url: "https://share.google/EgAmiu799NKeaP3H7",
      file: "page3_image1.avif",
      mime: "image/avif",
    },
    {
      title: "Meet Drew Bott | Memorial Artist",
      source: "Shoutout Colorado",
      date: "2022-06-28",
      category: "Local Stories",
      url: "https://share.google/IhxfBsJTo2burMZ5R",
      file: "page3_image2.jpg",
      mime: "image/jpeg",
    },
  ];

  for (const [index, story] of stories.entries()) {
    const existing = await strapi
      .documents("api::press-item.press-item")
      .findFirst({ filters: { url: story.url } });
    if (existing) continue;
    const name = `news-${story.file}`;
    let media = await strapi.db.query("plugin::upload.file").findOne({ where: { name } });
    if (!media) {
      const filepath = path.resolve(
        strapi.dirs.app.root,
        "../../bott-monument-design/images",
        story.file,
      );
      const info = await stat(filepath);
      [media] = await strapi
        .plugin("upload")
        .service("upload")
        .upload({
          data: { fileInfo: { name, alternativeText: `${story.source} article` } },
          files: { filepath, originalFilename: name, mimetype: story.mime, size: info.size },
        });
    }
    await strapi.documents("api::press-item.press-item").create({
      status: "published",
      data: {
        title: story.title,
        source: story.source,
        date: story.date,
        category: story.category,
        url: story.url,
        image: media.id,
        featured: true,
        sortOrder: index + 1,
      },
    });
  }

  strapi.log.info("Press items published.");
}
