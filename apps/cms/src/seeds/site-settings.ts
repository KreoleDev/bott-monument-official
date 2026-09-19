import type { Core } from "@strapi/strapi";

export async function seedSiteSettings(strapi: Core.Strapi) {
  const documents = strapi.documents("api::site-setting.site-setting");
  if (await documents.findFirst()) return;
  await documents.create({ status: "published", data: {} });
}
