import type { Core } from '@strapi/strapi';
import { stat } from 'node:fs/promises';
import path from 'node:path';

export async function seedShowroom(strapi: Core.Strapi) {
  const documents = strapi.documents('api::homepage-section.homepage-section');
  if (await documents.findFirst({ filters: { sectionKey: 'showroom' } })) return;
  const name = 'showroom-office1.jpeg';
  let media = await strapi.db.query('plugin::upload.file').findOne({ where: { name } });
  if (!media) {
    const filepath = path.resolve(strapi.dirs.app.root, '../../bott-monument-design/images/office1.jpeg');
    const info = await stat(filepath);
    [media] = await strapi.plugin('upload').service('upload').upload({ data: { fileInfo: { name, alternativeText: 'Bott Monument showroom interior' } }, files: { filepath, originalFilename: name, mimetype: 'image/jpeg', size: info.size } });
  }
  await documents.create({ status: 'published', data: {
    sectionKey: 'showroom', eyebrow: 'A Legacy of Craft', title: 'Trusted for generations', image: media.id,
    buttonLabel: 'Schedule a Visit', buttonHref: '#contact', sortOrder: 7,
    showroom: { visitTitle: 'Visit our showroom', location: 'Wyoming Studio', appointment: 'By appointment only', hours: 'Mon-Fri · 9am-5pm\nSat · by appointment', statistics: [{ value: '35+', label: 'Years' }, { value: '6', label: 'States' }, { value: '1k+', label: 'Memorials' }] },
  } });
  strapi.log.info('Showroom content and original image published.');
}
