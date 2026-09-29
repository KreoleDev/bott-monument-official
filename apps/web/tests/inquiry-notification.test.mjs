import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const source = ts.transpileModule(
  fs.readFileSync(
    new URL("../../cms/src/api/inquiry/content-types/inquiry/lifecycles.ts", import.meta.url),
    "utf8",
  ),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;
const entry = {
  result: {
    name: "<script>sample</script>",
    email: "visitor@example.invalid",
    inquiryType: "Not sure yet",
    message: "Test <b>message</b>",
    documentId: "test",
  },
};
function setup(enabled, send) {
  const errors = [];
  const context = {
    exports: {},
    process: {
      env: {
        INQUIRY_NOTIFICATIONS_ENABLED: enabled ? "true" : "false",
        SMTP_HOST: "mock",
        INQUIRY_NOTIFICATION_TO: "owner@example.invalid",
      },
    },
    strapi: {
      plugin: () => ({ service: () => ({ send }) }),
      log: { error: (message) => errors.push(message) },
    },
  };
  vm.runInNewContext(source, context);
  return { hook: context.exports.default, errors };
}
test("notifications remain disabled unless explicitly enabled", async () => {
  let sends = 0;
  const s = setup(false, async () => sends++);
  await s.hook.afterCreate(entry);
  assert.equal(sends, 0);
});
test("notification escapes visitor HTML and uses visitor only as reply-to", async () => {
  let message;
  const s = setup(true, async (data) => {
    message = data;
  });
  await s.hook.afterCreate(entry);
  assert.equal(message.to, "owner@example.invalid");
  assert.equal(message.replyTo, "visitor@example.invalid");
  assert.ok(message.html.includes("&lt;script&gt;"));
  assert.ok(!message.html.includes("<script>"));
});
test("failed notification does not reject the saved inquiry", async () => {
  const s = setup(true, async () => {
    throw new Error("SMTP offline");
  });
  await s.hook.afterCreate(entry);
  assert.equal(s.errors.length, 1);
});
