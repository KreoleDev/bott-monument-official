import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { matchesSecret } from "@/lib/secret";
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!matchesSecret(url.searchParams.get("secret"), process.env.PREVIEW_SECRET))
    return new Response("Unauthorized", { status: 401 });
  const path = url.searchParams.get("path") || "/";
  if (!["/", "/news"].includes(path)) return new Response("Invalid preview path", { status: 400 });
  (await draftMode()).enable();
  const response = NextResponse.redirect(new URL(path, url.origin));
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
