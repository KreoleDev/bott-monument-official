import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { matchesSecret } from "@/lib/secret";
import { isLocaleCode } from "@/lib/locale";
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!matchesSecret(url.searchParams.get("secret"), process.env.PREVIEW_SECRET))
    return new Response("Unauthorized", { status: 401 });
  const path = url.searchParams.get("path") || "/";
  const segments = path.split("/").filter(Boolean);
  const validPath =
    (segments.length === 1 && isLocaleCode(segments[0]) && path === `/${segments[0]}`) ||
    (segments.length === 2 &&
      isLocaleCode(segments[0]) &&
      segments[1] === "news" &&
      path === `/${segments[0]}/news`);
  if (!validPath) return new Response("Invalid preview path", { status: 400 });
  (await draftMode()).enable();
  const response = NextResponse.redirect(new URL(path, url.origin));
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
