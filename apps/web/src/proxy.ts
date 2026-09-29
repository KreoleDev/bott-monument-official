import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocaleCode } from "@/lib/locale";

export function proxy(request: NextRequest) {
  const firstSegment = request.nextUrl.pathname.split("/").filter(Boolean)[0];
  const locale =
    firstSegment && firstSegment !== "news" && isLocaleCode(firstSegment)
      ? firstSegment
      : DEFAULT_LOCALE;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-locale", locale);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
