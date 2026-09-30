import type { Core } from "@strapi/strapi";

const revalidatedModels = [
  "api::color-palette.color-palette",
  "api::comment.comment",
  "api::feature.feature",
  "api::gallery-item.gallery-item",
  "api::page.page",
  "api::press-item.press-item",
  "api::site-setting.site-setting",
  "plugin::upload.file",
];

let revalidationTimer: NodeJS.Timeout | undefined;

function scheduleWebRevalidation(strapi: Core.Strapi) {
  const webUrl = process.env.WEB_URL?.replace(/\/$/, "");
  const secret = process.env.REVALIDATION_SECRET;

  if (!webUrl || !secret) return;

  if (revalidationTimer) clearTimeout(revalidationTimer);

  revalidationTimer = setTimeout(async () => {
    try {
      const response = await fetch(`${webUrl}/api/revalidate`, {
        method: "POST",
        headers: { "x-revalidation-secret": secret },
      });

      if (!response.ok) {
        strapi.log.warn(`Web revalidation failed with status ${response.status}`);
      }
    } catch (error) {
      strapi.log.warn(
        `Web revalidation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }, 1500);
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.db.lifecycles.subscribe({
      models: revalidatedModels,
      afterCreate() {
        scheduleWebRevalidation(strapi);
      },
      afterUpdate() {
        scheduleWebRevalidation(strapi);
      },
      afterDelete() {
        scheduleWebRevalidation(strapi);
      },
    });
  },
};
