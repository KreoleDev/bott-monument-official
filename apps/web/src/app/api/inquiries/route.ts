import { getHomepageSection } from "@/lib/strapi";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json({ error: "Invalid content type" }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > 24000)
    return Response.json({ error: "Message too large" }, { status: 413 });
  try {
    const raw = await request.text();
    if (raw.length > 24000) return Response.json({ error: "Message too large" }, { status: 413 });
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object")
      return Response.json({ error: "Invalid form" }, { status: 400 });
    if (body.website) return Response.json({ ok: true });
    const { name, email, inquiryType, message = "" } = body;
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 150 ||
      typeof email !== "string" ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof inquiryType !== "string" ||
      inquiryType.length > 150 ||
      typeof message !== "string" ||
      message.length > 5000
    )
      return Response.json({ error: "Invalid form" }, { status: 400 });
    const section = await getHomepageSection("contact");
    const options = (section?.contact?.inquiryTypes || "").split("\n").map((s) => s.trim());
    if (!options.includes(inquiryType))
      return Response.json({ error: "Invalid inquiry type" }, { status: 400 });
    const url = process.env.STRAPI_URL?.replace(/\/$/, "");
    const token = process.env.STRAPI_INQUIRY_TOKEN;
    if (!url || !token) return Response.json({ error: "Service unavailable" }, { status: 503 });
    const response = await fetch(`${url}/graphql`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query:
          "mutation SubmitInquiry($data: InquiryInput!) { createInquiry(data: $data) { documentId } }",
        variables: {
          data: { name: name.trim(), email: email.trim(), inquiryType, message: message.trim() },
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
