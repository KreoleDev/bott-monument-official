import { redirect } from "next/navigation";
import { localizedPath } from "@/lib/locale";
import { detectedLocale } from "@/lib/server-locale";

export default async function NewsLocaleRedirect() {
  redirect(localizedPath(await detectedLocale(), "/news"));
}
