import { DEFAULT_LOCALE, isLocaleCode } from "@/lib/locale";

const MAX_JSON_BYTES = 24000;
const MAX_IMAGES = 3;
const MAX_MULTIPART_BYTES = 16 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

function isFormDataBody(value: unknown): value is FormData {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { get?: unknown }).get === "function" &&
    typeof (value as { append?: unknown }).append === "function"
  );
}

function isUploadedFile(value: unknown): value is File {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === "function" &&
    typeof (value as { name?: unknown }).name === "string" &&
    typeof (value as { size?: unknown }).size === "number" &&
    typeof (value as { type?: unknown }).type === "string"
  );
}

function getAllowedOrigins(request: Request) {
  const headers = request.headers;
  const origins = new Set([new URL(request.url).origin]);
  const forwardedHost = headers.get("x-forwarded-host") || headers.get("host");
  const forwardedProto = headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) origins.add(`${forwardedProto}://${forwardedHost}`);
  return origins;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && !getAllowedOrigins(request).has(origin))
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  const contentType = request.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const isMultipart = contentType.includes("multipart/form-data");
  if (!isJson && !isMultipart) return Response.json({ error: "Invalid content type" }, { status: 415 });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (
    (isJson && contentLength > MAX_JSON_BYTES) ||
    (isMultipart && contentLength > MAX_MULTIPART_BYTES)
  )
    return Response.json({ error: "Message too large" }, { status: 413 });
  try {
    const body = isMultipart ? await request.formData() : JSON.parse(await request.text());
    if (!isMultipart && JSON.stringify(body).length > MAX_JSON_BYTES)
      return Response.json({ error: "Message too large" }, { status: 413 });
    if (!body || typeof body !== "object")
      return Response.json({ error: "Invalid form" }, { status: 400 });
    const isFormBody = isFormDataBody(body);
    const getValue = (key: string) =>
      isFormBody ? body.get(key) : (body as Record<string, unknown>)[key];
    if (getValue("website")) return Response.json({ ok: true });
    const name = getValue("name");
    const email = getValue("email");
    const message = getValue("message") || "";
    const localeValue = getValue("locale");
    const locale = typeof localeValue === "string" ? localeValue : DEFAULT_LOCALE;
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 150 ||
      typeof email !== "string" ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof message !== "string" ||
      message.length > 5000 ||
      !isLocaleCode(locale)
    )
      return Response.json({ error: "Invalid form" }, { status: 400 });
    const url = process.env.STRAPI_URL?.replace(/\/$/, "");
    const token = process.env.STRAPI_INQUIRY_TOKEN;
    if (!url || !token) return Response.json({ error: "Service unavailable" }, { status: 503 });
    const data = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      submissionLocale: locale,
    };
    const attachments = isFormBody
      ? body
          .getAll("attachment")
          .filter((file): file is File => isUploadedFile(file) && file.size > 0)
      : [];
    if (attachments.length > MAX_IMAGES)
      return Response.json({ error: "Too many images" }, { status: 400 });
    if (attachments.length) {
      if (
        attachments.some(
          (attachment) =>
            !isUploadedFile(attachment) ||
            attachment.size > MAX_IMAGE_BYTES ||
            !ALLOWED_IMAGE_TYPES.has(attachment.type),
        )
      )
        return Response.json({ error: "Invalid image" }, { status: 400 });
      const payload = new FormData();
      payload.append("data", JSON.stringify(data));
      for (const attachment of attachments) {
        payload.append("files.attachment", attachment, attachment.name);
      }
      const response = await fetch(`${url}/api/inquiries`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || !result.data?.documentId)
        return Response.json({ error: "Unable to save inquiry" }, { status: 502 });
      return Response.json({ ok: true }, { status: 201 });
    }
    const response = await fetch(`${url}/graphql`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query:
          "mutation SubmitInquiry($data: InquiryInput!) { createInquiry(data: $data) { documentId } }",
        variables: {
          data: {
            ...data,
          },
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || result.errors?.length || !result.data?.createInquiry?.documentId)
      return Response.json({ error: "Unable to save inquiry" }, { status: 502 });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: "Unable to process inquiry" },
      { status: error instanceof SyntaxError ? 400 : 503 },
    );
  }
}
