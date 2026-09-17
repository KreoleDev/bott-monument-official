import type { Core } from "@strapi/strapi";

const allowedMediaTypes = [
  "image/*",
  "video/*",
  "audio/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.*",
  "text/plain",
  "text/csv",
];

const deniedTypes = [
  "image/svg+xml",
  "application/vnd.microsoft.portable-executable",
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-executable",
  "application/x-dosexec",
  "application/x-sh",
  "text/x-shellscript",
  "application/x-mach-binary",
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  graphql: {
    config: {
      endpoint: "/graphql",
      shadowCRUD: true,
      depthLimit: env.int("GRAPHQL_DEPTH_LIMIT", 8),
      defaultLimit: env.int("GRAPHQL_DEFAULT_LIMIT", 25),
      maxLimit: env.int("GRAPHQL_MAX_LIMIT", 100),
      landingPage: env.bool("GRAPHQL_LANDING_PAGE", env("NODE_ENV") !== "production"),
      subscriptions: false,
    },
  },
  ...(env("SMTP_HOST")
    ? {
        email: {
          config: {
            provider: "nodemailer",
            providerOptions: {
              host: env("SMTP_HOST"),
              port: env.int("SMTP_PORT", 587),
              secure: env.bool("SMTP_SECURE", false),
              auth: { user: env("SMTP_USER"), pass: env("SMTP_PASSWORD") },
            },
            settings: { defaultFrom: env("EMAIL_FROM"), defaultReplyTo: env("EMAIL_REPLY_TO") },
          },
        },
      }
    : {}),
  "users-permissions": {
    config: {
      jwtManagement: "refresh",
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      ...(env("S3_BUCKET")
        ? {
            provider: "aws-s3",
            providerOptions: {
              baseUrl: env("MEDIA_PUBLIC_URL"),
              s3Options: {
                region: env("S3_REGION"),
                endpoint: env("S3_ENDPOINT"),
                forcePathStyle: env.bool("S3_FORCE_PATH_STYLE", false),
                credentials: {
                  accessKeyId: env("S3_ACCESS_KEY_ID"),
                  secretAccessKey: env("S3_SECRET_ACCESS_KEY"),
                },
                params: { Bucket: env("S3_BUCKET") },
              },
            },
          }
        : {}),
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});

export default config;
