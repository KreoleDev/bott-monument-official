import { DEFAULT_LOCALE, isLocaleCode } from "@/lib/locale";

const MAX_JSON_BYTES = 24000;
const MAX_IMAGES = 3;
const MAX_MULTIPART_BYTES = 64 * 1024 * 1024;
const MAX_IMAGE_MB = 20;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/x-png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"]);

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

function getFileExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() || "";
}

function isAllowedImage(file: File) {
  if (ALLOWED_IMAGE_TYPES.has(file.type)) return true;
  return (!file.type || file.type === "application/octet-stream") &&
    ALLOWED_IMAGE_EXTENSIONS.has(getFileExtension(file));
}

function getStrapiError(result: unknown) {
  if (!result || typeof result !== "object") return null;
  const error = (result as { error?: unknown }).error;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  const errors = (result as { errors?: unknown }).errors;
  if (Array.isArray(errors)) {
    const messages = errors
      .map((item) =>
        item && typeof item === "object" && typeof (item as { message?: unknown }).message === "string"
          ? (item as { message: string }).message
          : null,
      )
      .filter(Boolean);
    if (messages.length) return messages.join("; ");
  }
  return null;
}

function getAllowedOrigins(request: Request) {
  const headers = request.headers;
  const origins = new Set([new URL(request.url).origin]);
  const forwardedHost = headers.get("x-forwarded-host") || headers.get("host");
  const forwardedProto = headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) origins.add(`${forwardedProto}://${forwardedHost}`);
  return origins;
}

async function createInquiry(url: string, token: string, data: Record<string, string | string[]>) {
  const response = await fetch(`${url}/graphql`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query:
        "mutation SubmitInquiry($data: InquiryInput!) { createInquiry(data: $data) { documentId } }",
      variables: { data },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  return { response, result: await response.json() };
}

async function verifyTurnstile(responseToken: string, expectedHostname: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { configured: false, valid: false };

  const body = new URLSearchParams({ secret, response: responseToken });
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Turnstile verification unavailable");
  const result = await response.json();
  return {
    configured: true,
    valid:
      result.success === true &&
      result.action === "inquiry" &&
      result.hostname === expectedHostname,
  };
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
    const turnstileToken = getValue("cf-turnstile-response");
    const localTurnstileBypass =
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_LOCAL_TURNSTILE_BYPASS === "true";
    if (!localTurnstileBypass) {
      if (typeof turnstileToken !== "string" || !turnstileToken)
        return Response.json({ error: "Please complete the spam check and try again." }, { status: 400 });
      const originHostname = origin ? new URL(origin).hostname : new URL(request.url).hostname;
      const turnstile = await verifyTurnstile(turnstileToken, originHostname);
      if (!turnstile.configured)
        return Response.json({ error: "Spam protection is not configured." }, { status: 503 });
      if (!turnstile.valid)
        return Response.json({ error: "Spam check failed. Please try again." }, { status: 400 });
    }
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
      responseStatus: "new",
    };
    const attachments = isFormBody
      ? body
          .getAll("attachment")
          .filter((file): file is File => isUploadedFile(file) && file.size > 0)
      : [];
    if (attachments.length > MAX_IMAGES)
      return Response.json({ error: "Too many images" }, { status: 400 });
    if (attachments.length) {
      if (attachments.some((attachment) => attachment.size > MAX_IMAGE_BYTES))
        return Response.json(
          { error: `Each image must be ${MAX_IMAGE_MB} MB or smaller.` },
          { status: 400 },
        );
      if (
        attachments.some(
          (attachment) =>
            !isUploadedFile(attachment) ||
            !isAllowedImage(attachment),
        )
      )
        return Response.json(
          { error: "Images must be JPG, PNG, WebP, GIF, HEIC, or HEIF." },
          { status: 400 },
        );
      const payload = new FormData();
      for (const attachment of attachments) {
        payload.append("files", attachment, attachment.name);
      }
      const uploadResponse = await fetch(`${url}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });
      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok || !Array.isArray(uploadResult)) {
        const error = getStrapiError(uploadResult) || "Unable to save image";
        if (process.env.NODE_ENV !== "production")
          console.warn("Strapi inquiry upload failed", uploadResult);
        return Response.json({ error }, { status: 502 });
      }
      const attachmentIds = uploadResult
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const id = (item as { id?: unknown }).id;
          return typeof id === "number" || typeof id === "string" ? String(id) : null;
        })
        .filter((id): id is string => Boolean(id));
      if (attachmentIds.length !== attachments.length) {
        if (process.env.NODE_ENV !== "production")
          console.warn("Strapi inquiry upload returned unexpected files", uploadResult);
        return Response.json({ error: "Unable to save image" }, { status: 502 });
      }
      const { response: createResponse, result: createResult } = await createInquiry(
        url,
        token,
        { ...data, attachment: attachmentIds },
      );
      if (
        !createResponse.ok ||
        createResult.errors?.length ||
        !createResult.data?.createInquiry?.documentId
      ) {
        const error = getStrapiError(createResult) || "Unable to save inquiry";
        if (process.env.NODE_ENV !== "production")
          console.warn("Strapi inquiry create failed", createResult);
        return Response.json({ error }, { status: 502 });
      }
      return Response.json({ ok: true }, { status: 201 });
    }
    const { response, result } = await createInquiry(url, token, data);
    if (!response.ok || result.errors?.length || !result.data?.createInquiry?.documentId) {
      const error = getStrapiError(result) || "Unable to save inquiry";
      if (process.env.NODE_ENV !== "production") console.warn("Strapi inquiry create failed", result);
      return Response.json({ error }, { status: 502 });
    }
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: "Unable to process inquiry" },
      { status: error instanceof SyntaxError ? 400 : 503 },
    );
  }
}
