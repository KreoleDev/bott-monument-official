import type { Core } from "@strapi/strapi";
import comments from "./comments.json";

export async function seedComments(strapi: Core.Strapi) {
  const collection = strapi.documents("api::comment.comment");
  for (const data of comments) {
    if (!(await collection.findFirst({ filters: { sortOrder: data.sortOrder } }))) {
      await collection.create({ status: "published", data });
    }
  }
  strapi.log.info("Comment placeholders published.");
}
