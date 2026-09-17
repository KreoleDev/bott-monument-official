import type { Core } from "@strapi/strapi";
import path from "node:path";
import { stat } from "node:fs/promises";
export async function seedSiteSettings(strapi: Core.Strapi) {
  const documents = strapi.documents("api::site-setting.site-setting");
  if (await documents.findFirst()) return;
  const filepath = path.resolve(strapi.dirs.app.root, "../web/public/bott-logo.png");
  let media = await strapi.db
    .query("plugin::upload.file")
    .findOne({ where: { name: "bott-site-logo.png" } });
  if (!media)
    [media] = await strapi
      .plugin("upload")
      .service("upload")
      .upload({
        data: { fileInfo: { name: "bott-site-logo.png", alternativeText: "Bott Monument" } },
        files: {
          filepath,
          originalFilename: "bott-site-logo.png",
          mimetype: "image/png",
          size: (await stat(filepath)).size,
        },
      });
  await documents.create({
    status: "published",
    data: {
      siteName: "Bott Monument",
      seoTitle: "Bott Monument",
      seoDescription: "Custom memorials crafted in stone.",
      logo: media.id,
    },
  });
}
