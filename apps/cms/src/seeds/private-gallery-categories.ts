import type { Core } from "@strapi/strapi";

const privateGalleryCategories = [
  "Monuments",
  "Headstones",
  "Cemetery Art",
  "Custom Work",
  "Restoration",
  "Etchings",
];

const categoryUid = "api::private-gallery-category.private-gallery-category";

export async function seedPrivateGalleryCategories(strapi: Core.Strapi) {
  for (const [index, name] of privateGalleryCategories.entries()) {
    const existing = await strapi.documents(categoryUid).findFirst({
      filters: { name },
      status: "published",
    });
    if (existing) continue;

    const draft = await strapi.documents(categoryUid).findFirst({
      filters: { name },
      status: "draft",
    });

    if (draft?.documentId) {
      await strapi.documents(categoryUid).update({
        documentId: draft.documentId,
        status: "published",
        data: { name, sortOrder: index + 1 },
      });
      continue;
    }

    await strapi.documents(categoryUid).create({
      status: "published",
      data: { name, sortOrder: index + 1 },
    });
  }

  strapi.log.info("Private gallery categories published.");
}
