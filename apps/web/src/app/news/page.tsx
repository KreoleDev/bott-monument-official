import { DEFAULT_LOCALE } from "@/lib/locale";
import { NewsPage } from "../news-page";

export const metadata = { title: "Press Coverage" };

export default function DefaultNewsPage() {
  return <NewsPage locale={DEFAULT_LOCALE} />;
}
