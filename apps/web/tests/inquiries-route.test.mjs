import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./load-ts.mjs";

test("inquiry API accepts submissions without category choices", async () => {
  let mutation;
  const { POST } = loadTs("../src/app/api/inquiries/route.ts", {
    env: { STRAPI_URL: "http://cms", STRAPI_INQUIRY_TOKEN: "submit-token" },
    fetch: async (_url, options) => {
      mutation = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({ data: { createInquiry: { documentId: "inquiry-1" } } }),
      };
    },
  });
  const response = await POST(
    new Request("http://site.test/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Visitor",
        email: "visitor@example.com",
        message: "Tell me about this person.",
        locale: "en",
      }),
    }),
  );
  assert.equal(response.status, 201);
  assert.equal(mutation.variables.data.name, "Visitor");
  assert.equal(mutation.variables.data.inquiryType, undefined);
  assert.equal(mutation.variables.data.message, "Tell me about this person.");
});
