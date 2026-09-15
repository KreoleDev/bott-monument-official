import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  {name:'strapi::security',config:{contentSecurityPolicy:{useDefaults:true,directives:{
    'img-src':["'self'",'data:','blob:',...env.array('MEDIA_CSP_ORIGINS',[])],
    'media-src':["'self'",'data:','blob:',...env.array('MEDIA_CSP_ORIGINS',[])],
  }}}},
  {
    name: 'strapi::cors',
    config: {
      origin: env.array('CORS_ORIGINS', ['http://localhost:3000']),
      credentials: true,
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
