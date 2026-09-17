import type { Core } from "@strapi/strapi";

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  preview: {
    enabled: Boolean(env("PREVIEW_SECRET")),
    config: {
      allowedOrigins: [env("WEB_URL", "http://localhost:3000")],
      async handler(uid: string) {
        const path = uid === "api::press-item.press-item" ? "/news" : "/";
        return `${env("WEB_URL", "http://localhost:3000")}/api/preview?${new URLSearchParams({ secret: env("PREVIEW_SECRET", ""), path })}`;
      },
    },
  },
  auth: {
    secret: env("ADMIN_JWT_SECRET")!,
  },
  apiToken: {
    salt: env("API_TOKEN_SALT")!,
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT")!,
    },
  },
  secrets: {
    encryptionKey: env("ENCRYPTION_KEY")!,
  },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", true),
    docLinks: env.bool("FLAG_DOC_LINKS", true),
  },
});

export default config;
