import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { preferredLocale } from "@/lib/locale";

export default async function PrivateGalleryEntryPage() {
  const requestHeaders = await headers();
  const locale = preferredLocale(requestHeaders.get("accept-language"), ["en", "pt"]);
  redirect(`/${locale}/private-gallery`);
}
