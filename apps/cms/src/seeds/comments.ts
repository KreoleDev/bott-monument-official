import type { Core } from '@strapi/strapi';
import comments from './comments.json';

export async function seedComments(strapi: Core.Strapi) {
  const sections = strapi.documents('api::homepage-section.homepage-section');
  if (await sections.findFirst({ filters: { sectionKey: 'testimonials' } })) return;
  const collection = strapi.documents('api::comment.comment');
  for (const data of comments) {
    if (!await collection.findFirst({ filters: { sortOrder: data.sortOrder } })) {
      await collection.create({ status: 'published', data });
    }
  }
  await sections.create({ status: 'published', data: {
    sectionKey: 'testimonials', title: 'Trusted With', description: 'What Matters Most', sortOrder: 8,
  } });
  strapi.log.info('Comments section and nine design placeholders published.');
}
