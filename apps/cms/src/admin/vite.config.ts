import { mergeConfig, type UserConfig } from "vite";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);

export default (config: UserConfig) =>
  mergeConfig(config, {
    resolve: {
      alias: {
        // Strapi 5.53 does not publicly export its component input renderer.
        // Keep its native media, relations, validation and permissions intact.
        "@bott/component-input": path.join(
          path.dirname(require.resolve("@strapi/content-manager/package.json")),
          "dist/admin/pages/EditView/components/FormInputs/Component/Input.mjs",
        ),
        "@bott/content-input": path.join(
          path.dirname(require.resolve("@strapi/content-manager/package.json")),
          "dist/admin/pages/EditView/components/InputRenderer.mjs",
        ),
      },
    },
  });
