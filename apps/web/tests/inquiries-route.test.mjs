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

test("inquiry API attaches up to three uploaded images to the Strapi inquiry", async () => {
  let upload;
  let mutation;
  const calls = [];
  const { POST } = loadTs("../src/app/api/inquiries/route.ts", {
    env: { STRAPI_URL: "http://cms", STRAPI_INQUIRY_TOKEN: "submit-token" },
    fetch: async (url, options) => {
      calls.push(url);
      if (url.endsWith("/api/upload")) {
        upload = options.body;
        return {
          ok: true,
          json: async () => [{ id: 1 }, { id: 2 }, { id: 3 }],
        };
      }
      mutation = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({ data: { createInquiry: { documentId: "inquiry-1" } } }),
      };
    },
  });
  const body = new FormData();
  body.set("name", "Visitor");
  body.set("email", "visitor@example.com");
  body.set("message", "I have a reference photo.");
  body.set("locale", "en");
  body.append("attachment", new File(["fake image"], "memory-1.jpg", { type: "image/jpeg" }));
  body.append("attachment", new File(["fake image"], "memory-2.png", { type: "image/png" }));
  body.append("attachment", new File(["fake image"], "memory-3.webp", { type: "image/webp" }));

  const response = await POST(
    new Request("http://site.test/api/inquiries", {
      method: "POST",
      body,
    }),
  );

  assert.equal(response.status, 201);
  assert.deepEqual(calls, ["http://cms/api/upload", "http://cms/graphql"]);
  assert.deepEqual(mutation.variables.data.attachment, ["1", "2", "3"]);
  assert.deepEqual(
    upload.getAll("files").map((file) => file.name),
    ["memory-1.jpg", "memory-2.png", "memory-3.webp"],
  );
});

test("inquiry API rejects more than three image uploads", async () => {
  const { POST } = loadTs("../src/app/api/inquiries/route.ts", {
    env: { STRAPI_URL: "http://cms", STRAPI_INQUIRY_TOKEN: "submit-token" },
    fetch: async () => {
      throw new Error("Unexpected fetch");
    },
  });
  const body = new FormData();
  body.set("name", "Visitor");
  body.set("email", "visitor@example.com");
  body.set("message", "I have several photos.");
  body.set("locale", "en");
  for (const name of ["one.jpg", "two.jpg", "three.jpg", "four.jpg"]) {
    body.append("attachment", new File(["fake image"], name, { type: "image/jpeg" }));
  }

  const response = await POST(
    new Request("http://site.test/api/inquiries", {
      method: "POST",
      body,
    }),
  );

  assert.equal(response.status, 400);
});

test("inquiry API rejects unsupported image uploads", async () => {
  const { POST } = loadTs("../src/app/api/inquiries/route.ts", {
    env: { STRAPI_URL: "http://cms", STRAPI_INQUIRY_TOKEN: "submit-token" },
    fetch: async () => {
      throw new Error("Unexpected fetch");
    },
  });
  const body = new FormData();
  body.set("name", "Visitor");
  body.set("email", "visitor@example.com");
  body.set("message", "I have a file.");
  body.set("locale", "en");
  body.set("attachment", new File(["<svg />"], "unsafe.svg", { type: "image/svg+xml" }));

  const response = await POST(
    new Request("http://site.test/api/inquiries", {
      method: "POST",
      body,
    }),
  );

  assert.equal(response.status, 400);
});

test("inquiry API accepts extension fallback when browser omits image MIME type", async () => {
  let upload;
  const { POST } = loadTs("../src/app/api/inquiries/route.ts", {
    env: { STRAPI_URL: "http://cms", STRAPI_INQUIRY_TOKEN: "submit-token" },
    fetch: async (url, options) => {
      if (url.endsWith("/api/upload")) {
        upload = options.body;
        return {
          ok: true,
          json: async () => [{ id: 1 }],
        };
      }
      return {
        ok: true,
        json: async () => ({ data: { createInquiry: { documentId: "inquiry-1" } } }),
      };
    },
  });
  const body = new FormData();
  body.set("name", "Visitor");
  body.set("email", "visitor@example.com");
  body.set("message", "Browser did not send MIME.");
  body.set("locale", "en");
  body.append("attachment", new File(["fake image"], "memory.jpg", { type: "" }));

  const response = await POST(
    new Request("http://site.test/api/inquiries", {
      method: "POST",
      body,
    }),
  );

  assert.equal(response.status, 201);
  assert.equal(upload.get("files").name, "memory.jpg");
});

test("inquiry API creates the inquiry with uploaded image ids", async () => {
  let mutation;
  const { POST } = loadTs("../src/app/api/inquiries/route.ts", {
    env: { STRAPI_URL: "http://cms", STRAPI_INQUIRY_TOKEN: "submit-token" },
    fetch: async (url, options) => {
      if (url.endsWith("/api/upload")) {
        return {
          ok: true,
          json: async () => [{ id: 1 }],
        };
      }
      mutation = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({ data: { createInquiry: { documentId: "inquiry-1" } } }),
      };
    },
  });
  const body = new FormData();
  body.set("name", "Visitor");
  body.set("email", "visitor@example.com");
  body.set("message", "REST response shape.");
  body.set("locale", "en");
  body.append("attachment", new File(["fake image"], "memory.jpg", { type: "image/jpeg" }));

  const response = await POST(
    new Request("http://site.test/api/inquiries", {
      method: "POST",
      body,
    }),
  );

  assert.equal(response.status, 201);
  assert.deepEqual(mutation.variables.data.attachment, ["1"]);
});
